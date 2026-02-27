'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2, Trash2 } from 'lucide-react';
import { Execution, PromptVersion } from '@prisma/client';
import { PanoramicResponseModal } from './PanoramicResponseModal';
import { PanoramicMultiResponseModal } from './PanoramicMultiResponseModal';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

type FullVersion = PromptVersion & { executions: Execution[] };

export function ExecutionHistory({ promptId }: { promptId: string }) {
    const { language, t } = useLanguage();
    const [versions, setVersions] = useState<FullVersion[]>([]);

    // Panoramic Modal State
    const [panoramicData, setPanoramicData] = useState<{ open: boolean, exec: Execution & { renderedMap?: any } | null }>({ open: false, exec: null });
    const [multiPanoramicData, setMultiPanoramicData] = useState<{ open: boolean, group: any | null }>({ open: false, group: null });

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

    const handleDelete = async (executionIds: string[]) => {
        try {
            const res = await fetch('/api/executions/delete-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executionIds }),
            });
            if (res.ok) {
                toast.success(executionIds.length === 1 ? t.history.confirmDelete : t.history.responses + ' ' + (language === 'es' ? 'eliminadas' : 'deleted'));
                fetchHistory();
                // If we deleted a group, might be better to clear selection if we had one
            } else {
                toast.error(language === 'es' ? 'Error al eliminar' : 'Error deleting');
            }
        } catch (e) {
            console.error(e);
            toast.error(language === 'es' ? 'Error al eliminar' : 'Error deleting');
        }
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
        return <div className="text-muted-foreground text-sm">{t.history.empty}</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-foreground tracking-tight">{t.history.title}</h3>
            <div className="flex flex-col gap-8">
                {(() => {
                    // Flatten all executions from all versions and group globally
                    type ExecutionWithVersion = Execution & { versionNumber: number; templateText: string; modelConfig: any };
                    type ExecutionGroup = {
                        renderedPrompt: string;
                        variablesUsed: any;
                        templateText: string;
                        modelConfig: any;
                        variations: ExecutionWithVersion[];
                        lastTimestamp: Date;
                    };

                    const allExecutions: ExecutionWithVersion[] = [];
                    versions.forEach(ver => {
                        ver.executions.forEach(exec => {
                            allExecutions.push({
                                ...exec,
                                versionNumber: ver.versionNumber,
                                templateText: ver.templateText,
                                modelConfig: ver.modelConfig
                            });
                        });
                    });

                    if (allExecutions.length === 0) {
                        return <div className="text-muted-foreground text-sm italic bg-muted p-8 rounded-2xl border border-border text-center">{t.history.empty}</div>;
                    }

                    const groups: ExecutionGroup[] = [];
                    const keyMap = new Map<string, number>();

                    // Sort all executions by date (newest first)
                    allExecutions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).forEach((exec) => {
                        const modelStr = exec.modelConfig?.model || 'unknown';
                        const tempStr = exec.modelConfig?.temperature ?? 'unknown';
                        const key = `${exec.renderedPrompt}|${modelStr}|${tempStr}`;

                        if (keyMap.has(key)) {
                            groups[keyMap.get(key)!].variations.push(exec);
                        } else {
                            keyMap.set(key, groups.length);
                            groups.push({
                                renderedPrompt: exec.renderedPrompt,
                                variablesUsed: exec.variablesUsed,
                                templateText: exec.templateText,
                                modelConfig: exec.modelConfig,
                                variations: [exec],
                                lastTimestamp: new Date(exec.createdAt)
                            });
                        }
                    });

                    return (
                        <Accordion type="single" collapsible className="w-full space-y-5">
                            {groups.map((group, gIdx) => (
                                <AccordionItem key={gIdx} value={`group-${gIdx}`} className="bg-card border border-border hover:border-violet-300 shadow-sm rounded-2xl overflow-hidden transition-all">
                                    <div className="relative flex items-center group/item">
                                        <AccordionTrigger className="hover:no-underline p-5 py-4 group/trigger flex-1">
                                            <div className="flex w-full items-center justify-between pr-14">
                                                <div className="flex items-center gap-6">
                                                    {/* Version & Basic Info */}
                                                    <div className="flex flex-col items-start min-w-[120px]">
                                                        <h4 className="text-sm font-black text-foreground group-hover/trigger:text-violet-600 dark:group-hover/trigger:text-violet-400 transition-colors uppercase tracking-tighter">
                                                            {t.history.version} {group.variations[0].versionNumber}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[9px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded border border-violet-200 dark:border-violet-800">
                                                                {group.modelConfig?.model || (language === 'es' ? 'Desconocido' : 'Unknown')}
                                                            </span>
                                                            <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                                T: {group.modelConfig?.temperature ?? '-'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Separator Line */}
                                                    <div className="hidden lg:block h-8 w-px bg-border/60"></div>

                                                    {/* Responses Count Badge */}
                                                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                                                        <span className="text-[10px] font-black text-white bg-violet-600 px-3 py-1 rounded-lg shadow-sm">
                                                            {group.variations.length} {group.variations.length === 1 ? t.common.responses.slice(0, -1).toUpperCase() : t.common.responses.toUpperCase()}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-0 group-hover/trigger:opacity-100 transition-opacity">{t.history.viewDetails}</span>
                                                    </div>

                                                    {/* Preview Variables - Beautiful Tags */}
                                                    {group.variablesUsed && typeof group.variablesUsed === 'object' && Object.keys(group.variablesUsed).length > 0 && (
                                                        <div className="hidden md:flex items-center gap-2 flex-wrap max-w-[400px]">
                                                            {Object.entries(group.variablesUsed as Record<string, string>).slice(0, 3).map(([k, v]) => (
                                                                <div key={k} className="flex flex-col bg-muted/40 border border-border/60 rounded-lg px-2.5 py-1 min-w-[80px] hover:bg-muted/80 transition-colors">
                                                                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">{k}</span>
                                                                    <span className="text-[10px] text-foreground font-bold truncate max-w-[100px] leading-tight">{v || '—'}</span>
                                                                </div>
                                                            ))}
                                                            {Object.keys(group.variablesUsed).length > 3 && (
                                                                <div className="h-8 w-8 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/20">
                                                                    <span className="text-[10px] text-muted-foreground font-black">+{Object.keys(group.variablesUsed).length - 3}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        {/* Action button with proper spacing */}
                                        <div className="absolute right-4 flex items-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all rounded-xl z-10 border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (confirm(t.history.deleteGroup.replace('{n}', group.variations.length.toString()))) {
                                                        handleDelete(group.variations.map(v => v.id));
                                                    }
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <AccordionContent className="p-6 pt-2 bg-muted/20 border-t border-border">
                                        <div className="flex flex-col gap-8">
                                            {/* The Prompt Sent (Shared for all variations in this group) */}
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between pl-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t.history.sentPrompt}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-2 text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300 dark:border-violet-800 dark:hover:bg-violet-950/30 rounded-lg ml-4 shadow-sm font-bold text-[11px] uppercase tracking-wider group/recycle"
                                                            onClick={() => {
                                                                window.dispatchEvent(new CustomEvent('reuse-version', {
                                                                    detail: {
                                                                        templateText: group.templateText,
                                                                        modelConfig: group.modelConfig,
                                                                        executions: [{ variablesUsed: group.variablesUsed }]
                                                                    }
                                                                }));
                                                                toast.success(t.history.reused);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                        >
                                                            <RefreshCw size={12} className="group-hover/recycle:rotate-180 transition-transform duration-500" />
                                                            {t.history.reusePrompt}
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
                                                <div className="flex items-center gap-3 pl-1 w-full">
                                                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em] shrink-0">{language === 'es' ? 'Respuestas Generadas' : 'Generated Responses'}</span>
                                                    <div className="h-px bg-violet-100 dark:bg-violet-900/30 flex-1"></div>
                                                    {group.variations.length > 1 && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-tight shadow-sm bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setMultiPanoramicData({ open: true, group });
                                                            }}
                                                        >
                                                            <Maximize2 size={12} />
                                                            {t.history.comparison}
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-4 pb-4">
                                                    {group.variations.map((v, vIdx) => (
                                                        <div key={v.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:border-violet-200 transition-all flex flex-col">
                                                            <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="bg-violet-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">V{v.versionNumber}</span>
                                                                    <span className="text-[10px] font-bold text-muted-foreground italic">{new Date(v.createdAt).toLocaleString()}</span>
                                                                    <span className="text-[10px] font-semibold text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded border border-violet-100 dark:border-violet-800">
                                                                        {v.tokensTotal} {t.history.tokens} • {v.latencyMs}{t.history.latency}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 gap-2 text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg px-2 text-[10px] font-bold uppercase tracking-tight"
                                                                        onClick={() => setPanoramicData({ open: true, exec: v })}
                                                                    >
                                                                        <Maximize2 size={12} />
                                                                        {language === 'es' ? 'Vista Panorámica' : 'Panoramic View'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            if (confirm(t.history.confirmDelete)) {
                                                                                handleDelete([v.id]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </Button>
                                                                </div>
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
                    title={language === 'es' ? "Resultado Histórico" : "Historical Result"}
                    aiOutput={panoramicData.exec.aiOutput}
                    renderedPrompt={panoramicData.exec.renderedPrompt}
                    tokensTotal={panoramicData.exec.tokensTotal}
                    latencyMs={panoramicData.exec.latencyMs}
                />
            )}

            {/* Panoramic Multi-Response Modal */}
            {multiPanoramicData.group && (
                <PanoramicMultiResponseModal
                    open={multiPanoramicData.open}
                    onOpenChange={(open) => setMultiPanoramicData(prev => ({ ...prev, open }))}
                    renderedPrompt={multiPanoramicData.group.renderedPrompt}
                    modelConfig={multiPanoramicData.group.modelConfig}
                    variations={multiPanoramicData.group.variations}
                    onDeleteVariation={async (id) => {
                        await handleDelete([id]);
                        // Update local modal variations state
                        setMultiPanoramicData(prev => {
                            if (!prev.group) return prev;
                            const remainingVariations = prev.group.variations.filter((v: any) => v.id !== id);
                            if (remainingVariations.length === 0) {
                                return { open: false, group: null };
                            }
                            return {
                                ...prev,
                                group: { ...prev.group, variations: remainingVariations }
                            };
                        });
                    }}
                />
            )}
        </div>
    );
}
