'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [promptToDelete, setPromptToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        try {
            const res = await fetch('/api/prompts');
            const data = await res.json();
            if (Array.isArray(data)) {
                setPrompts(data);
            }
        } catch (error) {
            toast.error('Error al cargar la lista de prompts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!promptToDelete) return;
        try {
            const res = await fetch(`/api/prompts/${promptToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Prompt eliminado correctamente');
                setPrompts(prompts.filter(p => p.id !== promptToDelete));
            } else {
                toast.error('Error al eliminar el prompt');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setPromptToDelete(null);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto w-full flex-1">
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Gestión de Prompts</h1>
                <Link href="/prompts/create">
                    <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 rounded-lg px-6 h-11 font-medium transition-all duration-300 hover:scale-105">
                        Crear Nuevo Prompt
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-muted-foreground animate-pulse">Cargando...</div>
            ) : prompts.length === 0 ? (
                <div className="text-muted-foreground bg-card p-12 rounded-2xl border border-border shadow-sm text-center flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center text-violet-500 text-2xl mb-2">✨</div>
                    <p className="text-lg">Aún no hay prompts creados.</p>
                    <p className="text-sm">Da clic en "Crear Nuevo Prompt" para empezar a versionar tu magia.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prompts.map(prompt => (
                        <div key={prompt.id} className="relative group">
                            <Link href={`/prompts/${prompt.id}`} className="block h-full">
                                <Card className="p-6 h-full bg-card hover:bg-muted/50 border-border hover:border-violet-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col rounded-2xl group-hover:border-violet-300">
                                    <h2 className="text-xl font-bold text-foreground mb-3 pr-8 truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{prompt.name}</h2>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 leading-relaxed">
                                        {prompt.description || 'Sin descripción'}
                                    </p>
                                    <div className="text-xs font-medium text-muted-foreground flex justify-between items-center mt-auto pt-4 border-t border-border">
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                                            Versiones: <span className="text-muted-foreground font-semibold">{prompt.versions?.length || 0}</span>
                                        </span>
                                        <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Card>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPromptToDelete(prompt.id);
                                }}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={!!promptToDelete} onOpenChange={(open) => !open && setPromptToDelete(null)}>
                <DialogContent className="bg-card border-border rounded-2xl shadow-xl text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground">¿Estás seguro?</DialogTitle>
                        <DialogDescription className="text-stone-500 pt-3">
                            Esta acción no se puede deshacer. Se eliminará permanentemente este prompt y todo su historial de versiones y ejecuciones.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-3">
                        <Button variant="outline" onClick={() => setPromptToDelete(null)} className="border-border hover:bg-muted rounded-lg font-medium text-foreground">Cancelar</Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md">Sí, eliminar prompt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
