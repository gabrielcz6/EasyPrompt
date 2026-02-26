'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2 } from 'lucide-react';
import { Execution, PromptVersion } from '@prisma/client';
import { PanoramicResponseModal } from './PanoramicResponseModal';
import { toast } from 'sonner';

type FullVersion = PromptVersion & { executions: Execution[] };

export function ExecutionHistory({ promptId }: { promptId: string }) {
    const [versions, setVersions] = useState<FullVersion[]>([]);

    // Panoramic Modal State
    const [panoramicData, setPanoramicData] = useState<{ open: boolean, exec: Execution & { renderedMap?: any } | null }>({ open: false, exec: null });

    const renderPromptWithVariables = (templateText: string, variablesUsed: any) => {
        if (!templateText) return null;
        // Robust regex matching server-side and builder logic
        const parts = templateText.split(/(\{\{\s*.*?\s*\}\})/g);

        return parts.map((part, i) => {
            if (/^\{\{\s*.*?\s*\}\}$/.test(part)) {
                const varName = part.slice(2, -2).trim();
                const val = variablesUsed && typeof variablesUsed === 'object' ? (variablesUsed as Record<string, string>)[varName] : undefined;

                if (val !== undefined) {
                    // If it's a dotted variable (e.g. category.string), show the full dotted name
                    // otherwise show the value.
                    const displayValue = varName.includes('.') ? varName : (val || varName);
                    return (
                        <span key={i} className="inline-flex items-center justify-center bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 mx-[1px] px-1.5 py-0.5 rounded-md font-bold border border-violet-200 dark:border-violet-800 shadow-sm align-baseline leading-none text-[10px]">
                            {displayValue}
                        </span>
                    );
                }
            }
            return <span key={i}>{part}</span>;
        });
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/prompts/${promptId}/history`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchHistory();
        // Listen for custom event triggered by AiConfigPanel after execution
        window.addEventListener('prompt-executed', fetchHistory);
        return () => window.removeEventListener('prompt-executed', fetchHistory);
    }, [promptId]);

    if (versions.length === 0) {
        return <div className="text-muted-foreground text-sm">Aún no hay ejecuciones para este prompt.</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-foreground tracking-tight">Historial de Ejecuciones</h3>
            <div className="flex flex-col gap-8">
                {(() => {
                    // Flatten all executions from all versions and group globally
                    type ExecutionWithVersion = Execution & { versionNumber: number; templateText: string };
                    type ExecutionGroup = {
                        renderedPrompt: string;
                        variablesUsed: any;
                        templateText: string;
                        variations: ExecutionWithVersion[];
                        lastTimestamp: Date;
                    };

                    const allExecutions: ExecutionWithVersion[] = [];
                    versions.forEach(ver => {
                        ver.executions.forEach(exec => {
                            allExecutions.push({
                                ...exec,
                                versionNumber: ver.versionNumber,
                                templateText: ver.templateText
                            });
                        });
                    });

                    if (allExecutions.length === 0) {
                        return <div className="text-muted-foreground text-sm italic bg-muted p-8 rounded-2xl border border-border text-center">Aún no hay ejecuciones registradas.</div>;
                    }

                    const groups: ExecutionGroup[] = [];
                    const keyMap = new Map<string, number>();

                    // Sort all executions by date (newest first)
                    allExecutions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).forEach((exec) => {
                        const key = exec.renderedPrompt;
                        if (keyMap.has(key)) {
                            groups[keyMap.get(key)!].variations.push(exec);
                        } else {
                            keyMap.set(key, groups.length);
                            groups.push({
                                renderedPrompt: exec.renderedPrompt,
                                variablesUsed: exec.variablesUsed,
                                templateText: exec.templateText,
                                variations: [exec],
                                lastTimestamp: new Date(exec.createdAt)
                            });
                        }
                    });

                    return (
                        <Accordion type="single" collapsible className="w-full space-y-5">
                            {groups.map((group, gIdx) => (
                                <AccordionItem key={gIdx} value={`group-${gIdx}`} className="bg-card border border-border hover:border-violet-300 shadow-sm rounded-2xl overflow-hidden px-1 transition-all">
                                    <AccordionTrigger className="hover:no-underline p-5 py-4 group">
                                        <div className="flex w-full items-center justify-between pr-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-start translate-y-[1px]">
                                                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors uppercase tracking-tight">
                                                        Input de Prompt #{groups.length - gIdx}
                                                    </h4>
                                                    <span className="text-[10px] text-muted-foreground font-medium">{group.variations.length} {group.variations.length === 1 ? 'resultado' : 'resultados / variaciones'}</span>
                                                </div>
                                                {group.variations.length > 1 && (
                                                    <span className="text-[10px] font-black text-white bg-violet-600 px-2.5 py-1 rounded-full animate-in zoom-in duration-300 shadow-sm">
                                                        {group.variations.length} VARIACIONES
                                                    </span>
                                                )}
                                            </div>

                                            {/* Preview Variables */}
                                            {group.variablesUsed && typeof group.variablesUsed === 'object' && Object.keys(group.variablesUsed).length > 0 && (
                                                <div className="hidden md:flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {Object.entries(group.variablesUsed as Record<string, string>).slice(0, 3).map(([k, v]) => (
                                                        <span key={k} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border font-bold">
                                                            {k}: <span className="text-foreground">{v || '—'}</span>
                                                        </span>
                                                    ))}
                                                    {Object.keys(group.variablesUsed).length > 3 && (
                                                        <span className="text-[10px] text-stone-400 font-bold">+{Object.keys(group.variablesUsed).length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="p-6 pt-2 bg-muted/20 border-t border-border">
                                        <div className="flex flex-col gap-8">
                                            {/* The Prompt Sent (Shared for all variations in this group) */}
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between pl-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Prompt Enviado (Inyectado)</span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-2 text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300 dark:border-violet-800 dark:hover:bg-violet-950/30 rounded-lg ml-4 shadow-sm font-bold text-[11px] uppercase tracking-wider group/recycle"
                                                            onClick={() => {
                                                                window.dispatchEvent(new CustomEvent('reuse-version', {
                                                                    detail: {
                                                                        templateText: group.templateText,
                                                                        executions: [{ variablesUsed: group.variablesUsed }]
                                                                    }
                                                                }));
                                                                toast.success("Prompt y variables restaurados en el editor");
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                        >
                                                            <RefreshCw size={12} className="group-hover/recycle:rotate-180 transition-transform duration-500" />
                                                            Reciclar Prompt
                                                        </Button>
                                                    </div>
                                                    <div className="h-px bg-border flex-1 ml-4"></div>
                                                </div>
                                                <div className="relative group/prompt">
                                                    <ScrollArea className="max-h-[300px] w-full rounded-2xl border border-border bg-card p-5 text-[15px] text-foreground whitespace-pre-wrap leading-relaxed shadow-sm overflow-auto">
                                                        <div className="min-h-[20px]">
                                                            {renderPromptWithVariables(group.templateText, group.variablesUsed)}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            </div>

                                            {/* Variations List */}
                                            <div className="flex flex-col gap-5">
                                                <div className="flex items-center gap-2 pl-1">
                                                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em]">Resultados por Versión</span>
                                                    <div className="h-px bg-violet-100 dark:bg-violet-900/30 flex-1"></div>
                                                </div>

                                                <div className="space-y-4 pb-4">
                                                    {group.variations.map((v, vIdx) => (
                                                        <div key={v.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:border-violet-200 transition-all flex flex-col">
                                                            <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="bg-violet-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">V{v.versionNumber}</span>
                                                                    <span className="text-[10px] font-bold text-muted-foreground italic">{new Date(v.createdAt).toLocaleString()}</span>
                                                                    <span className="text-[10px] font-semibold text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded border border-violet-100 dark:border-violet-800">
                                                                        {v.tokensTotal} tkns • {v.latencyMs}ms
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 gap-2 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg px-2 text-[10px] font-bold uppercase tracking-tight"
                                                                    onClick={() => setPanoramicData({ open: true, exec: v })}
                                                                >
                                                                    <Maximize2 size={12} />
                                                                    Vista Panorámica
                                                                </Button>
                                                            </div>
                                                            <ScrollArea className="w-full h-[250px] bg-gradient-to-br from-transparent to-muted/10">
                                                                <div className="p-5 text-[15px] text-foreground whitespace-pre-wrap leading-relaxed">
                                                                    {v.aiOutput}
                                                                </div>
                                                            </ScrollArea>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    );
                })()}
            </div>

            {/* Panoramic Execution Result Modal */}
            {panoramicData.exec && (
                <PanoramicResponseModal
                    open={panoramicData.open}
                    onOpenChange={(open) => setPanoramicData(prev => ({ ...prev, open }))}
                    title="Resultado Histórico"
                    aiOutput={panoramicData.exec.aiOutput}
                    renderedPrompt={panoramicData.exec.renderedPrompt}
                    tokensTotal={panoramicData.exec.tokensTotal}
                    latencyMs={panoramicData.exec.latencyMs}
                />
            )}
        </div>
    );
}
