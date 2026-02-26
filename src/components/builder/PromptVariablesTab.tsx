'use client';

import { useState, useEffect } from 'react';
import { Fragment } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function PromptVariablesTab({ promptId }: { promptId: string }) {
    const [allVariables, setAllVariables] = useState<Fragment[]>([]);
    const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/fragments').then(res => res.json()),
            fetch(`/api/prompts/${promptId}`).then(res => res.json())
        ]).then(([fragmentsData, promptData]) => {
            if (Array.isArray(fragmentsData)) setAllVariables(fragmentsData);
            if (promptData?.fragments) {
                setImportedIds(new Set(promptData.fragments.map((f: Fragment) => f.id)));
            }
            setLoading(false);
        }).catch(() => {
            toast.error('Error al cargar datos');
            setLoading(false);
        });
    }, [promptId]);

    const toggleImport = (id: string) => {
        setImportedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/prompts/${promptId}/fragments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fragmentIds: Array.from(importedIds) }),
            });
            if (res.ok) {
                toast.success('Variables del prompt guardadas');
            } else {
                toast.error('Error al guardar variables');
            }
        } catch {
            toast.error('Error de red');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Cargando variables...</div>;

    // Group variables by category
    const grouped = allVariables.reduce((acc, variable) => {
        if (!acc[variable.category]) acc[variable.category] = [];
        acc[variable.category].push(variable);
        return acc;
    }, {} as Record<string, Fragment[]>);

    return (
        <div className="flex-1 overflow-y-auto p-10 max-w-6xl mx-auto w-full bg-[#F9F8F6] text-stone-800">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-4xl font-extrabold text-stone-800 tracking-tight">Importar Variables</h2>
                    <p className="text-stone-500 text-base mt-2">Selecciona qué variables globales quieres tener disponibles en el panel lateral del editor para este prompt.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 rounded-lg px-6 h-11 font-medium transition-all hover:scale-105"
                >
                    {saving ? 'Guardando...' : 'Guardar Selección'}
                </Button>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="text-stone-500 bg-[#FCFCFA] border border-stone-200/50 p-12 text-center rounded-2xl shadow-sm text-lg">
                    No hay variables globales configuradas. Ve a la pestaña de Variables para crear algunas.
                </div>
            ) : (
                <div className="space-y-10">
                    {Object.entries(grouped).map(([category, vars]) => (
                        <div key={category} className="space-y-5">
                            <h3 className="text-xl font-bold text-stone-700 uppercase tracking-widest border-b border-stone-200 pb-3">{category}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {vars.map(v => {
                                    const isImported = importedIds.has(v.id);
                                    return (
                                        <Card
                                            key={v.id}
                                            onClick={() => toggleImport(v.id)}
                                            className={`p-5 cursor-pointer transition-all duration-300 border rounded-2xl ${isImported
                                                ? 'bg-violet-50 border-violet-400 shadow-md ring-1 ring-violet-400/50'
                                                : 'bg-[#FCFCFA] border-stone-200 hover:border-violet-300 shadow-sm hover:shadow-md hover:-translate-y-1'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className={`font-bold ${isImported ? 'text-violet-900' : 'text-stone-700'}`}>{v.label}</h4>
                                                {isImported && <div className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.5)]" />}
                                            </div>
                                            <p className="text-xs text-stone-500 font-mono leading-relaxed line-clamp-3">{v.content}</p>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
