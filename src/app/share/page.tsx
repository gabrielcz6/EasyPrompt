'use client';

import { useEffect, useState } from 'react';
import LZString from 'lz-string';
import { PanoramicResponseModal } from '@/components/executions/PanoramicResponseModal';
import { PanoramicMultiResponseModal } from '@/components/executions/PanoramicMultiResponseModal';
import { Loader2 } from 'lucide-react';

export default function SharePage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Get hash minus the '#d=' part
            const hash = window.location.hash;
            if (!hash || !hash.startsWith('#d=')) {
                setError('Enlace inválido o incompleto.');
                return;
            }

            const compressed = hash.substring(3);
            const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

            if (!decompressed) {
                setError('No se pudo leer la información del enlace (puede estar dañado).');
                return;
            }

            const parsed = JSON.parse(decompressed);
            setData(parsed);
        } catch (err) {
            console.error(err);
            setError('Error al procesar el enlace compartido.');
        }
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Enlace de Compartición Inválido</h1>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Cargando resultado compartido...</p>
            </div>
        );
    }

    // Since our modals use Dialog which expects to be triggered or absolute, 
    // and we want this page to BE the modal content naturally, 
    // we just render the modal with open=true and hide any close behaviors.
    // However, the modals are built to fill the screen anyway via `!w-[100vw] !h-[100vh]`.
    // We pass an empty function to onOpenChange so it can't be closed.

    if (data.type === 'single') {
        return (
            <div className="share-wrapper flex w-full h-full min-h-screen">
                <PanoramicResponseModal
                    open={true}
                    onOpenChange={() => { }}
                    title={data.title}
                    aiOutput={data.aiOutput}
                    renderedPrompt={data.renderedPrompt}
                    tokensTotal={data.tokensTotal}
                    latencyMs={data.latencyMs}
                />
            </div>
        );
    }

    if (data.type === 'multi') {
        return (
            <div className="share-wrapper flex w-full h-full min-h-screen">
                <PanoramicMultiResponseModal
                    open={true}
                    onOpenChange={() => { }}
                    renderedPrompt={data.renderedPrompt}
                    modelConfig={data.modelConfig}
                    variations={data.variations}
                />
            </div>
        );
    }

    return null;
}
