'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Fragment } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreatePromptPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Variables state
    const [allVariables, setAllVariables] = useState<Fragment[]>([]);
    const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
    const [loadingVars, setLoadingVars] = useState(true);

    useEffect(() => {
        fetch('/api/fragments')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAllVariables(data);
                setLoadingVars(false);
            })
            .catch(() => {
                toast.error('Error al cargar variables disponibles');
                setLoadingVars(false);
            });
    }, []);

    const toggleImport = (id: string) => {
        setImportedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    templateText: '', // Start empty
                    modelConfig: { provider: 'openai', model: 'gpt-4o' }, // default
                    fragmentIds: Array.from(importedIds)
                }),
            });

            if (res.ok) {
                const newPrompt = await res.json();
                toast.success('Prompt creado');
                router.push(`/prompts/${newPrompt.id}`);
            } else {
                toast.error('Error al crear el prompt');
            }
        } catch {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Group variables by category
    const grouped = allVariables.reduce((acc, variable) => {
        if (!acc[variable.category]) acc[variable.category] = [];
        acc[variable.category].push(variable);
        return acc;
    }, {} as Record<string, Fragment[]>);

    return (
        <div className="p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col items-center">
            <h1 className="text-4xl font-extrabold mb-8 text-foreground tracking-tight text-center">Crear Nuevo Prompt</h1>

            <Card className="p-8 bg-card border-border shadow-xl shadow-slate-200/10 rounded-2xl w-full">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-stone-600 mb-2 block">Nombre del Prompt</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Ej: Clasificador de Comentarios"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-all rounded-lg h-11"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-stone-600 mb-2 block">Descripción (Opcional)</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripción de lo que hace este prompt..."
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-all rounded-lg min-h-[120px] resize-y"
                        />
                    </div>
                    <div className="pt-4 border-t border-stone-200/50">
                        <label className="text-sm font-semibold text-stone-600 mb-4 block">Importar Variables Globales (Opcional)</label>

                        {loadingVars ? (
                            <div className="text-stone-500 animate-pulse text-sm">Cargando variables...</div>
                        ) : Object.keys(grouped).length === 0 ? (
                            <div className="text-stone-500 text-sm bg-stone-50 p-4 rounded-lg">
                                No hay variables globales configuradas. Podrás agregarlas después.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-x-12 gap-y-8">
                                {Object.entries(grouped).map(([category, vars]) => (
                                    <div key={category} className="space-y-3 min-w-[200px]">
                                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">{category}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {vars.map(v => {
                                                const isImported = importedIds.has(v.id);
                                                return (
                                                    <div
                                                        key={v.id}
                                                        onClick={() => toggleImport(v.id)}
                                                        className={`p-3 cursor-pointer transition-all duration-200 border rounded-xl flex items-center justify-between gap-3 ${isImported
                                                            ? 'bg-violet-50 border-violet-400 shadow-sm ring-1 ring-violet-400/50'
                                                            : 'bg-white border-stone-200 hover:border-violet-300 shadow-sm'
                                                            }`}
                                                    >
                                                        <span className={`font-semibold text-sm truncate ${isImported ? 'text-violet-900' : 'text-stone-700'}`}>{v.label}</span>
                                                        {isImported && <div className="w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.5)] shrink-0" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-stone-200/50 mt-8">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push('/prompts')}
                            className="text-stone-500 hover:text-stone-800 hover:bg-[#EFECE6] font-medium rounded-lg px-5 h-11"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-violet-500/25 rounded-lg px-6 h-11 font-medium transition-all hover:scale-105"
                        >
                            {loading ? 'Creando...' : 'Crear e ir al Editor'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
