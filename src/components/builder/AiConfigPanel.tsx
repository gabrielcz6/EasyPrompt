'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PanoramicResponseModal } from '../executions/PanoramicResponseModal';
import { useLanguage } from '@/context/LanguageContext';

interface AiConfigPanelProps {
    templateText: string;
    variableValues: Record<string, string>;
    currentPromptId: string | null;
    onPromptLoaded: (promptId: string) => void;
}

export function AiConfigPanel({ templateText, variableValues, currentPromptId, onPromptLoaded }: AiConfigPanelProps) {
    const { language, t } = useLanguage();
    const [model, setModel] = useState('gpt-5.2');
    const [temperature, setTemperature] = useState(0.7);
    const [useMaxTokens, setUseMaxTokens] = useState(false);
    const [maxTokens, setMaxTokens] = useState(2000);

    const [models, setModels] = useState<{ id: string, name: string, provider: string }[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [showVersionModal, setShowVersionModal] = useState(false);

    // Panoramic Modal State
    const [panoramicData, setPanoramicData] = useState<{ open: boolean, aiOutput: string, renderedPrompt: string, tokensTotal: number, latencyMs: number } | null>(null);

    // Fetch Models
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await fetch('/api/models');
                if (res.ok) {
                    const data = await res.json();
                    setModels(data);
                    const defaultModel = data.find((m: any) => m.isDefault);
                    if (defaultModel) setModel(defaultModel.name);
                }
            } catch (e) {
                console.error("Failed to fetch models", e);
            }
        };
        fetchModels();
    }, []);

    // Listen to reuse-version to load historical config
    useEffect(() => {
        const handleReuse = (e: CustomEvent) => {
            const version = e.detail;
            if (version && version.modelConfig) {
                if (version.modelConfig.model) setModel(version.modelConfig.model);
                if (version.modelConfig.temperature !== undefined) setTemperature(version.modelConfig.temperature);
                if (version.modelConfig.max_tokens !== undefined) {
                    setUseMaxTokens(true);
                    setMaxTokens(version.modelConfig.max_tokens);
                } else {
                    setUseMaxTokens(false);
                }
            }
        };

        window.addEventListener('reuse-version', handleReuse as EventListener);
        return () => window.removeEventListener('reuse-version', handleReuse as EventListener);
    }, []);

    const executePrompt = async () => {
        setIsExecuting(true);
        let targetPromptId = currentPromptId;

        if (!targetPromptId) {
            toast.error(language === 'es' ? "Error: No se encontró el ID del prompt." : "Error: Prompt ID not found.");
            setIsExecuting(false);
            return;
        }

        try {
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    promptId: targetPromptId,
                    templateText,
                    modelConfig: {
                        provider: "openai",
                        model,
                        temperature,
                        ...(useMaxTokens ? { max_tokens: maxTokens } : {})
                    },
                    variablesUsed: variableValues,
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(language === 'es' ? `¡Ejecución exitosa! Se usaron ${data.execution.tokensTotal} tokens.` : `Execution successful! Used ${data.execution.tokensTotal} tokens.`);
                if (data.hasChanged) {
                    toast.info(language === 'es' ? `Se creó automáticamente una nueva versión (V${data.newVersionNumber}).` : `A new version was automatically created (V${data.newVersionNumber}).`);
                }

                // Trigger reload of history
                window.dispatchEvent(new CustomEvent('prompt-executed'));

                // Open Panoramic Modal
                setPanoramicData({
                    open: true,
                    aiOutput: data.execution.aiOutput,
                    renderedPrompt: data.execution.renderedPrompt,
                    tokensTotal: data.execution.tokensTotal,
                    latencyMs: data.execution.latencyMs
                });
            } else {
                toast.error(language === 'es' ? `Error en la ejecución: ${data.error}` : `Execution error: ${data.error}`);
            }
        } catch (e) {
            toast.error(language === 'es' ? "Error de red durante la ejecución." : "Network error during execution.");
        } finally {
            setIsExecuting(false);
            setShowVersionModal(false);
        }
    };

    const handlePreExecuteCheck = async () => {
        if (!templateText) {
            toast.warning(language === 'es' ? "El prompt está vacío" : "Prompt is empty");
            return;
        }

        if (!currentPromptId) {
            // It's the first time
            executePrompt();
            return;
        }

        // Attempt to check if we will create a version. 
        // Usually, we could just fire the request, but requirement states: 
        // "si cambia el texto o modelo, mostrar Modal: 'Atención, se creará la versión X'"
        // Since logic to check latest is on backend, we could fetch latest, compare, then pop modal.
        try {
            const res = await fetch('/api/prompts');
            const prompts = await res.json();
            const pt = prompts.find((p: any) => p.id === currentPromptId);

            if (pt && pt.versions.length > 0) {
                const latest = pt.versions[0];
                const changed = latest.templateText !== templateText ||
                    latest.modelConfig.model !== model ||
                    latest.modelConfig.temperature !== temperature ||
                    latest.modelConfig.max_tokens !== (useMaxTokens ? maxTokens : undefined);

                if (changed) {
                    setShowVersionModal(true);
                    return;
                }
            }
        } catch (e) { }

        // If no changes, or API check fails, just fire
        executePrompt();
    };

    return (
        <div className="flex flex-col gap-6 p-5">
            <div className="flex flex-col gap-5">
                <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-1">{t.builder.config}</h2>

                <div className="space-y-2">
                    <Label className="text-muted-foreground font-semibold ml-1">{language === 'es' ? 'Modelo' : 'Model'}</Label>
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-full bg-muted border-border text-foreground focus:ring-violet-500 rounded-lg h-10 font-medium">
                            <SelectValue placeholder={language === 'es' ? "Seleccionar modelo" : "Select model"} />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-lg">
                            {models.map(m => (
                                <SelectItem key={m.id} value={m.name} className="focus:bg-violet-50 dark:focus:bg-violet-900/40 focus:text-violet-700 cursor-pointer rounded-lg mx-1 my-1">
                                    {m.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center ml-1">
                        <Label className="text-muted-foreground font-semibold">{language === 'es' ? 'Temperatura' : 'Temperature'}</Label>
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-md">{temperature.toFixed(1)}</span>
                    </div>
                    <Slider
                        value={[temperature]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={(vals) => setTemperature(vals[0])}
                        className="w-full [&>span:first-child]:bg-muted [&_[role=slider]]:bg-background [&_[role=slider]]:border-violet-500 [&_[role=slider]]:border-2 [&_[role=slider]]:shadow-sm [&>span>span]:bg-violet-500 py-2"
                    />
                </div>

                <div className="space-y-4 pb-3">
                    <div className="flex justify-between items-center ml-1">
                        <Label className="text-muted-foreground font-semibold cursor-pointer" onClick={() => setUseMaxTokens(!useMaxTokens)}>
                            {language === 'es' ? 'Límite de Salida' : 'Output Limit'}
                        </Label>
                        <Switch
                            checked={useMaxTokens}
                            onCheckedChange={setUseMaxTokens}
                            className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-border"
                        />
                    </div>

                    {useMaxTokens && (
                        <div className="flex flex-col gap-2 ml-1 animate-in slide-in-from-top-2 duration-200">
                            <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">
                                {language === 'es' ? 'Tokens Máximos' : 'Max Tokens'}
                            </Label>
                            <Input
                                type="number"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 0)}
                                className="bg-muted border-border text-foreground focus:ring-violet-500 rounded-lg h-10 font-medium"
                                min={1}
                                max={4096}
                            />
                            <p className="text-[10px] text-muted-foreground/70 italic">
                                {language === 'es' ? 'Límite sugerido entre 1 y 4096 tokens.' : 'Suggested limit between 1 and 4096 tokens.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Button
                onClick={handlePreExecuteCheck}
                disabled={isExecuting}
                className="w-full mt-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 rounded-xl h-12 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] text-[15px]"
            >
                {isExecuting ? (language === 'es' ? 'Ejecutando...' : 'Executing...') : t.builder.execute}
            </Button>

            {/* Version Confirmation Modal */}
            <Dialog open={showVersionModal} onOpenChange={setShowVersionModal}>
                <DialogContent className="bg-card border-border text-foreground rounded-2xl shadow-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{language === 'es' ? 'Atención: Se creará una nueva versión' : 'Warning: A new version will be created'}</DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-3 leading-relaxed">
                            {language === 'es' ? 'Has modificado la plantilla del prompt o la configuración de IA. Ejecutar esto bloqueará los cambios creando automáticamente una nueva versión. ¿Deseas continuar?' : 'You have modified the prompt template or AI settings. Running this will lock the changes by automatically creating a new version. Do you want to proceed?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-6 flex gap-3">
                        <Button variant="outline" className="text-muted-foreground border-border hover:bg-muted hover:text-foreground rounded-lg h-11 px-5 font-semibold" onClick={() => setShowVersionModal(false)}>{t.common.cancel}</Button>
                        <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-violet-500/25 rounded-lg h-11 px-6 font-semibold" onClick={executePrompt} disabled={isExecuting}>
                            {isExecuting ? (language === 'es' ? 'Ejecutando...' : 'Executing...') : (language === 'es' ? 'Confirmar y Ejecutar' : 'Confirm and Execute')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Panoramic Execution Result Modal */}
            {panoramicData && (
                <PanoramicResponseModal
                    open={panoramicData.open}
                    onOpenChange={(open) => setPanoramicData(prev => prev ? { ...prev, open } : null)}
                    title={language === 'es' ? "Resultado de la Ejecución" : "Execution Result"}
                    aiOutput={panoramicData.aiOutput}
                    renderedPrompt={panoramicData.renderedPrompt}
                    tokensTotal={panoramicData.tokensTotal}
                    latencyMs={panoramicData.latencyMs}
                />
            )}
        </div>
    );
}
