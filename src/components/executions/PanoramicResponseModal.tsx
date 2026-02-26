import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[100vw] !w-[100vw] !max-h-[100vh] !h-[100vh] bg-background border-none text-foreground rounded-none shadow-none p-0 overflow-hidden flex flex-col transition-none">
                <DialogHeader className="p-6 pb-4 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-700">
                            {title}
                        </DialogTitle>
                        {(tokensTotal !== undefined || latencyMs !== undefined) && (
                            <div className="flex items-center gap-3 pr-8">
                                {latencyMs !== undefined && (
                                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
                                        Tiempo: {latencyMs}ms
                                    </span>
                                )}
                                {tokensTotal !== undefined && (
                                    <span className="text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/40 px-3 py-1.5 rounded-lg border border-violet-100 dark:border-violet-800 shadow-sm">
                                        Tokens: {tokensTotal}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-muted/5 gap-0 min-h-0">
                    {/* Left Side: Prompt Sent */}
                    <div className="flex flex-col border-r border-border p-6 h-full overflow-hidden min-h-0">
                        <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] pl-1 mb-3">Prompt Renderizado (Enviado)</h3>
                        <div className="flex-1 w-full bg-card rounded-2xl border border-border shadow-sm p-8 text-lg text-foreground font-sans leading-relaxed whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar outline-none" tabIndex={0}>
                            {renderedPrompt}
                        </div>
                    </div>

                    {/* Right Side: AI Response */}
                    <div className="flex flex-col p-6 h-full overflow-hidden bg-gradient-to-b from-violet-500/5 to-transparent min-h-0">
                        <h3 className="font-black text-[10px] text-violet-500 uppercase tracking-[0.3em] pl-1 mb-3">Respuesta Generada por IA</h3>
                        <div className="flex-1 w-full bg-card/50 rounded-2xl border border-violet-200/60 dark:border-violet-900/40 shadow-inner p-8 text-lg text-foreground font-sans leading-relaxed whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar outline-none" tabIndex={0}>
                            {aiOutput}
                        </div>
                    </div>
                </div>
                <style jsx global>{`
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
