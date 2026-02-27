import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Share2, FileText, ChevronRight, ChevronLeft, Minimize2, Maximize2, LayoutPanelLeft } from 'lucide-react';
import { toast } from 'sonner';
import LZString from 'lz-string';
import { exportMultiResponseToDocx } from '@/lib/docx-exporter';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface Variation {
    id: string;
    versionNumber: number;
    aiOutput: string;
    tokensTotal: number;
    latencyMs: number;
    createdAt: Date;
}

interface PanoramicMultiResponseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    renderedPrompt: string;
    modelConfig: any;
    variations: Variation[];
}

export function PanoramicMultiResponseModal({
    open,
    onOpenChange,
    renderedPrompt,
    modelConfig,
    variations,
}: PanoramicMultiResponseModalProps) {
    const { language, t } = useLanguage();
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
    const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);

    const toggleCollapse = (id: string) => {
        const next = new Set(collapsedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCollapsedIds(next);
    };

    const toggleAll = () => {
        if (collapsedIds.size === variations.length) {
            setCollapsedIds(new Set());
        } else {
            setCollapsedIds(new Set(variations.map(v => v.id)));
        }
    };
    const handleShare = () => {
        try {
            const payload = JSON.stringify({
                type: 'multi',
                renderedPrompt,
                modelConfig,
                variations: variations.map(v => ({
                    id: v.id,
                    versionNumber: v.versionNumber,
                    aiOutput: v.aiOutput,
                    tokensTotal: v.tokensTotal,
                    latencyMs: v.latencyMs,
                    createdAt: v.createdAt
                }))
            });
            const compressed = LZString.compressToEncodedURIComponent(payload);
            const url = `${window.location.origin}/share#d=${compressed}`;

            navigator.clipboard.writeText(url);
            toast.success(language === 'es' ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard', { description: language === 'es' ? 'Cualquiera con este enlace podrá ver esta comparación.' : 'Anyone with this link can view this comparison.' });
        } catch (error) {
            toast.error(language === 'es' ? 'Error al generar el enlace de compartir' : 'Error generating share link');
        }
    };

    const handleExportWord = async () => {
        try {
            await exportMultiResponseToDocx(renderedPrompt, modelConfig, variations);
            toast.success(language === 'es' ? 'Documento Word descargado.' : 'Word document downloaded.');
        } catch (error) {
            console.error("Error exporting to Word:", error);
            toast.error(language === 'es' ? 'Ocurrió un error al generar el documento.' : 'An error occurred while generating the document.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[100vw] !w-[100vw] !max-h-[100vh] !h-[100vh] bg-background border-none text-foreground rounded-none shadow-none p-0 overflow-hidden flex flex-col transition-none">
                <DialogHeader className="p-6 pb-4 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <DialogTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-700 print:text-black print:text-3xl tracking-tighter uppercase">
                                {t.comparison.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2 print:hidden">
                                <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded-md border border-border text-foreground tracking-wider uppercase">
                                    {modelConfig?.model || 'Desconocido'}
                                </span>
                                <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded-md border border-border text-foreground tracking-wider uppercase">
                                    TEMP: {modelConfig?.temperature ?? '-'}
                                </span>
                                <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 px-2 py-1 rounded-md border border-violet-200 dark:border-violet-800 shadow-sm uppercase tracking-wider">
                                    {variations?.length || 0} {t.comparison.responses}
                                </span>
                            </div>
                            <div className="h-6 w-px bg-border mx-2 print:hidden"></div>
                            <Button variant="outline" size="sm" onClick={handleShare} className="h-8 gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 print:hidden">
                                <Share2 size={14} />
                                {t.common.share}
                            </Button>
                            <Button variant="default" size="sm" onClick={handleExportWord} className="h-8 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white mr-4 print:hidden">
                                <FileText size={14} />
                                Word
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleAll}
                                className="h-8 gap-1.5 border-border hover:bg-muted text-muted-foreground mr-8 print:hidden font-bold uppercase text-[10px] tracking-widest"
                            >
                                <LayoutPanelLeft size={13} className={collapsedIds.size === variations.length ? 'rotate-90 transition-transform' : ''} />
                                {collapsedIds.size === variations.length ? t.comparison.expandAll : t.comparison.collapseAll}
                            </Button>
                        </div>
                        <div className="pr-4 text-xs font-semibold text-muted-foreground mr-8 print:hidden">
                            {t.comparison.sandbox}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden bg-muted/5 min-h-0 print:block print:overflow-visible">
                    {/* Left Side: Prompt Shared (Retractable) */}
                    <div
                        className={`flex flex-col border-r border-border p-6 transition-all duration-500 ease-in-out relative group/prompt-container print:border-none print:h-auto print:w-full print:mb-8
                            ${isPromptCollapsed ? 'w-[60px] bg-muted/20 px-0' : 'w-[40%] lg:w-[35%] bg-card'}
                        `}
                    >
                        {/* Collapse Button for Prompt */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPromptCollapsed(!isPromptCollapsed)}
                            className={`absolute -right-3 top-10 h-6 w-6 bg-background border border-border rounded-full shadow-sm z-30 hover:text-violet-600 transition-all
                                ${isPromptCollapsed ? 'rotate-180 -right-7' : ''}
                            `}
                        >
                            <ChevronLeft size={12} />
                        </Button>

                        {!isPromptCollapsed ? (
                            <div className="flex flex-col h-full animate-in fade-in duration-500">
                                <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] pl-1 mb-3 shrink-0 print:text-black print:text-sm">{t.comparison.prompt}</h3>
                                <div className="flex-1 w-full bg-card rounded-2xl border border-border shadow-sm p-6 text-[15px] text-foreground font-sans leading-relaxed whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar outline-none print:shadow-none print:border-gray-300 print:text-black print:bg-white print:overflow-visible print:text-base print:p-0" tabIndex={0}>
                                    {renderedPrompt}
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex-1 flex flex-col items-center pt-8 cursor-pointer hover:bg-muted/30 transition-colors h-full"
                                onClick={() => setIsPromptCollapsed(false)}
                            >
                                <span className="text-[12px] font-black text-muted-foreground rotate-90 origin-center whitespace-nowrap uppercase tracking-[0.5em] mt-20"> PROMPT </span>
                            </div>
                        )}
                    </div>

                    {/* Right Side / Bottom: AI Variations */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-violet-500/5 to-transparent h-[60%] lg:h-full relative print:bg-none print:h-auto print:overflow-visible">
                        {/* Shadow hints for scrolling */}
                        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 hidden lg:block print:hidden" />
                        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 hidden lg:block print:hidden" />

                        <div className="flex-1 flex gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar p-6 items-stretch print:flex-col print:overflow-visible print:gap-12 print:p-0">
                            {variations?.map((v, i) => {
                                const isCollapsed = collapsedIds.has(v.id);
                                return (
                                    <div
                                        key={v.id}
                                        className={`flex flex-col shrink-0 transition-all duration-500 ease-in-out shadow-sm overflow-hidden h-full relative group/card
                                            ${isCollapsed
                                                ? 'w-[60px] bg-muted/30 border border-border/40 hover:bg-muted/50 rounded-xl'
                                                : 'w-[85vw] md:w-[60vw] lg:w-[350px] bg-card/80 border border-violet-200/50 dark:border-violet-900/40 rounded-3xl hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-xl'
                                            } 
                                            print:w-full print:h-auto print:shadow-none print:border-none print:bg-white print:break-inside-avoid print:page-break-before-always`}
                                    >
                                        {!isCollapsed ? (
                                            <div className="flex flex-col h-full animate-in zoom-in-95 duration-500">
                                                {/* Card Header */}
                                                <div className="flex p-5 py-4 border-b border-border bg-muted/20 shrink-0">
                                                    <div className="flex flex-col w-full">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="bg-violet-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-md">
                                                                    {language === 'es' ? 'RES.' : 'RESP.'} {variations.length - i}
                                                                </span>
                                                                <span className="text-[11px] font-bold text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">{language === 'es' ? 'V' : 'V'}{v.versionNumber}</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => toggleCollapse(v.id)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 opacity-60 group-hover/card:opacity-100 transition-all hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-full"
                                                            >
                                                                <Minimize2 size={13} />
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center justify-between w-full mt-3">
                                                            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString()}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
                                                                    {v.tokensTotal} TKNS
                                                                </span>
                                                                <span className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-300 bg-fuchsia-100 dark:bg-fuchsia-900/40 px-2 py-0.5 rounded-full border border-fuchsia-200 dark:border-fuchsia-800">
                                                                    {v.latencyMs}MS
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Card Content */}
                                                <div className="flex-1 p-7 text-[15.5px] text-foreground font-sans leading-relaxed whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar outline-none print:p-0 print:pt-4" tabIndex={0}>
                                                    {v.aiOutput}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="flex-1 flex flex-col items-center pt-8 cursor-pointer h-full animate-in fade-in duration-500"
                                                onClick={() => toggleCollapse(v.id)}
                                            >
                                                <span className="text-[12px] font-black text-muted-foreground rotate-90 origin-center whitespace-nowrap uppercase tracking-[0.4em] mt-10">
                                                    {language === 'es' ? 'RES.' : 'RESP.'} {variations.length - i}
                                                </span>
                                                <div className="mt-auto mb-6 opacity-40 group-hover/card:opacity-100 transition-opacity">
                                                    <Maximize2 size={12} className="text-violet-600" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <style jsx global>{`
                    @media print {
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                            color: black !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        body * {
                            visibility: hidden;
                        }
                        [role="dialog"], [role="dialog"] * {
                            visibility: visible;
                        }
                        [role="dialog"] {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100vw !important;
                            height: auto !important;
                            min-height: 100vh !important;
                            max-height: none !important;
                            overflow: visible !important;
                            box-shadow: none !important;
                            background: white !important;
                        }
                        button, [data-radix-collection-item], .print\\:hidden {
                            display: none !important;
                        }
                    }
                    .custom-scrollbar [data-radix-scroll-area-viewport] {
                        scrollbar-width: thin !important;
                        scrollbar-color: rgba(139, 92, 246, 0.3) transparent !important;
                    }
                    /* Standard webkit scrollbar for compatibility */
                    .custom-scrollbar::-webkit-scrollbar,
                    .custom-scrollbar ::-webkit-scrollbar {
                        width: 10px !important;
                        height: 10px !important;
                        display: block !important;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track,
                    .custom-scrollbar ::-webkit-scrollbar-track {
                        background: transparent !important;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb,
                    .custom-scrollbar ::-webkit-scrollbar-thumb {
                        background-color: rgba(139, 92, 246, 0.4) !important;
                        border-radius: 20px !important;
                        border: 3px solid transparent !important;
                        background-clip: content-box !important;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover,
                    .custom-scrollbar ::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(139, 92, 246, 0.6) !important;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
