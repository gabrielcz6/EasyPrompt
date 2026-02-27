import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Share2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import LZString from 'lz-string';
import { exportSingleResponseToDocx } from '@/lib/docx-exporter';
import { useLanguage } from '@/context/LanguageContext';

interface PanoramicResponseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    aiOutput: string;
    renderedPrompt: string;
    tokensTotal?: number;
    latencyMs?: number;
}

export function PanoramicResponseModal({
    open,
    onOpenChange,
    title = "Respuesta Panorámica",
    aiOutput,
    renderedPrompt,
    tokensTotal,
    latencyMs,
}: PanoramicResponseModalProps) {
    const { language, t } = useLanguage();

    const handleShare = () => {
        try {
            const payload = JSON.stringify({
                type: 'single',
                title,
                aiOutput,
                renderedPrompt,
                tokensTotal,
                latencyMs
            });
            const compressed = LZString.compressToEncodedURIComponent(payload);
            const url = `${window.location.origin}/share#d=${compressed}`;

            navigator.clipboard.writeText(url);
            toast.success(language === 'es' ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard', { description: language === 'es' ? 'Cualquiera con este enlace podrá ver esta respuesta.' : 'Anyone with this link can view this response.' });
        } catch (error) {
            toast.error(language === 'es' ? 'Error al generar el enlace de compartir' : 'Error generating share link');
        }
    };

    const handleExportWord = async () => {
        try {
            await exportSingleResponseToDocx(title, renderedPrompt, aiOutput, tokensTotal, latencyMs);
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
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-700 print:text-black print:text-3xl">
                            {title}
                        </DialogTitle>
                        <div className="flex items-center gap-4 print:hidden">
                            {(tokensTotal !== undefined || latencyMs !== undefined) && (
                                <div className="flex items-center gap-3">
                                    {latencyMs !== undefined && (
                                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
                                            {language === 'es' ? 'Tiempo' : 'Time'}: {latencyMs}ms
                                        </span>
                                    )}
                                    {tokensTotal !== undefined && (
                                        <span className="text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/40 px-3 py-1.5 rounded-lg border border-violet-100 dark:border-violet-800 shadow-sm">
                                            Tokens: {tokensTotal}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="h-6 w-px bg-border mx-2"></div>
                            <Button variant="outline" size="sm" onClick={handleShare} className="h-8 gap-1.5 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30">
                                <Share2 size={14} />
                                {t.common.share}
                            </Button>
                            <Button variant="default" size="sm" onClick={handleExportWord} className="h-8 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white mr-8">
                                <FileText size={14} />
                                Word
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-muted/5 gap-0 min-h-0 print:block print:overflow-visible">
                    {/* Left Side: Prompt Sent */}
                    <div className="flex flex-col border-r border-border p-6 h-full overflow-hidden min-h-0 print:border-none print:h-auto print:mb-8 print:overflow-visible">
                        <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] pl-1 mb-3 print:text-black print:text-sm">{language === 'es' ? 'Prompt Renderizado (Enviado)' : 'Rendered Prompt (Sent)'}</h3>
                        <div className="flex-1 w-full bg-card rounded-2xl border border-border shadow-sm p-8 text-lg text-foreground font-sans leading-relaxed whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar outline-none print:shadow-none print:border-gray-300 print:text-black print:bg-white print:overflow-visible print:text-base print:p-0" tabIndex={0}>
                            {renderedPrompt}
                        </div>
                    </div>

                    {/* Right Side: AI Response */}
                    <div className="flex flex-col p-6 h-full overflow-hidden bg-gradient-to-b from-violet-500/5 to-transparent min-h-0 print:bg-none print:h-auto print:overflow-visible print:page-break-before-always">
                        <h3 className="font-black text-[10px] text-violet-500 dark:text-violet-400 uppercase tracking-[0.3em] pl-1 mb-3 print:text-black print:text-sm">{language === 'es' ? 'Respuesta Generada por IA' : 'AI Generated Response'}</h3>
                        <div className="flex-1 w-full bg-card/50 rounded-2xl border border-violet-200/60 dark:border-violet-900/40 shadow-inner p-8 text-lg text-foreground font-sans leading-relaxed whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar outline-none print:shadow-none print:border-gray-300 print:text-black print:bg-white print:overflow-visible print:text-base print:p-0" tabIndex={0}>
                            {aiOutput}
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
                    .custom-scrollbar ::-webkit-scrollbar {
                        width: 8px !important;
                        height: 8px !important;
                        display: block !important;
                    }
                    .custom-scrollbar ::-webkit-scrollbar-track {
                        background: transparent !important;
                    }
                    .custom-scrollbar ::-webkit-scrollbar-thumb {
                        background-color: rgba(139, 92, 246, 0.3) !important;
                        border-radius: 20px !important;
                        border: 2px solid transparent !important;
                        background-clip: content-box !important;
                    }
                    .custom-scrollbar ::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(139, 92, 246, 0.5) !important;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
