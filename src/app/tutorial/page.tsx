'use client';

import { Card } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';

export default function TutorialPage() {
    return (
        <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight">Tutorial de Uso</h1>
                <p className="text-stone-500 mt-2 text-lg">Aprende a gestionar, modularizar y versionar tus prompts como un experto.</p>
            </div>

            <Card className="p-4 bg-[#FCFCFA] border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="aspect-video bg-stone-900 rounded-2xl relative flex items-center justify-center overflow-hidden group">
                    <video
                        className="w-full h-full object-cover"
                        controls
                        poster="/tutorial/poster.jpg" // Optional: You can add a cover image here later
                    >
                        <source src="/tutorial/tutorial.mp4" type="video/mp4" />
                        Tu navegador no soporta la etiqueta de video.
                    </video>

                    {/* Fallback overlay in case the video hasn't loaded or doesn't exist yet */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/40 opacity-0 group-[.video-error]:opacity-100 transition-opacity">
                        <PlayCircle size={64} className="text-white/50 mb-4" />
                        <p className="text-white font-medium">Video pronto disponible...</p>
                    </div>
                </div>
            </Card>

            <div className="mt-12 bg-violet-50 border border-violet-100 rounded-2xl p-6 text-violet-800">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <PlayCircle size={20} />
                    Próximamente
                </h3>
                <p className="text-violet-600/80">
                    Estamos preparando una guía detallada paso a paso para que le saques el máximo provecho a la herramienta. Sube tu archivo <code className="bg-white/50 px-1.5 py-0.5 rounded text-violet-900">tutorial.mp4</code> a la carpeta <code className="bg-white/50 px-1.5 py-0.5 rounded text-violet-900">public/tutorial/</code> para que aparezca aquí mágicamente.
                </p>
            </div>
        </div>
    );
}
