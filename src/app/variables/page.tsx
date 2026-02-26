'use client';

import { useState, useEffect } from 'react';
import { Fragment } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Edit2, X, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function VariablesPage() {
    const [variables, setVariables] = useState<Fragment[]>([]);
    const [loading, setLoading] = useState(true);

    const [label, setLabel] = useState('');
    const [category, setCategory] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [variableToDelete, setVariableToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadVariables();
    }, []);

    const loadVariables = async () => {
        try {
            const res = await fetch('/api/fragments');
            const data = await res.json();
            if (Array.isArray(data)) {
                setVariables(data);
            }
        } catch (error) {
            toast.error('Error al cargar las variables');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/fragments/${editingId}` : '/api/fragments';
            const method = editingId ? 'PUT' : 'POST';

            const finalContent = `(${options.join('|')})`;

            if (options.length === 0) {
                toast.warning('Agrega al menos una opción a la lista');
                return;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label, category, content: finalContent }),
            });

            if (res.ok) {
                toast.success(editingId ? 'Variable actualizada exitosamente' : 'Variable creada exitosamente');
                resetForm();
                loadVariables();
            } else {
                toast.error(editingId ? 'Error al actualizar la variable' : 'Error al crear la variable');
            }
        } catch {
            toast.error('Error de conexión');
        }
    };

    const handleDelete = async () => {
        if (!variableToDelete) return;
        try {
            const res = await fetch(`/api/fragments/${variableToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Variable eliminada correctamente');
                setVariables(variables.filter(v => v.id !== variableToDelete));
                if (editingId === variableToDelete) {
                    resetForm();
                }
            } else {
                toast.error('Error al eliminar la variable');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setVariableToDelete(null);
        }
    };

    const editVariable = (variable: Fragment) => {
        setEditingId(variable.id);
        setLabel(variable.label);
        setCategory(variable.category);

        const content = variable.content.trim();
        if (content.startsWith('(') && content.endsWith(')')) {
            setOptions(content.slice(1, -1).split('|').map(s => s.trim()));
        } else {
            // Legacy / Fallback: convert plain text to single option
            setOptions([content]);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setLabel('');
        setCategory('');
        setOptions([]);
        setNewOption('');
    };

    const addOption = () => {
        if (!newOption.trim()) return;
        if (options.includes(newOption.trim())) {
            toast.warning('Esta opción ya existe');
            return;
        }
        setOptions([...options, newOption.trim()]);
        setNewOption('');
    };

    const removeOption = (optToRemove: string) => {
        setOptions(options.filter(opt => opt !== optToRemove));
    };

    return (
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
            <h1 className="text-4xl font-extrabold mb-10 text-foreground tracking-tight">Gestión de Variables Globales</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 md:col-span-1 bg-card border-border h-fit rounded-2xl shadow-sm hover:shadow-md transition-shadow relative text-foreground">
                    {editingId && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full"
                            onClick={resetForm}
                        >
                            <X size={16} />
                        </Button>
                    )}
                    <h2 className="text-xl font-bold mb-6 text-foreground">
                        {editingId ? 'Editar Variable' : 'Crear Nueva Variable'}
                    </h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Nombre (Ej: países)</label>
                            <Input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                required
                                className="bg-muted border-border text-foreground focus-visible:ring-violet-500 rounded-lg h-11 transition-all flex-1 placeholder:text-muted-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Categoría (Ej: geografía)</label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="bg-muted border-border text-foreground focus-visible:ring-violet-500 rounded-lg h-11 transition-all flex-1 placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-muted-foreground mb-1 block">Opciones de la Variable</label>
                            <p className="text-[10px] text-muted-foreground/60 mb-3 italic">Agrega una o varias opciones. Si es un valor fijo, agrega solo uno.</p>
                            <div className="flex gap-2">
                                <Input
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                                    placeholder="Ej: Peru o Estratega Senior..."
                                    className="bg-muted border-border text-foreground focus-visible:ring-violet-500 rounded-lg h-11 transition-all flex-1"
                                />
                                <Button type="button" onClick={addOption} className="h-11 px-4 bg-violet-100 dark:bg-violet-900/40 hover:bg-violet-200 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-400 shadow-sm rounded-lg">
                                    <Plus size={18} />
                                </Button>
                            </div>

                            {options.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {options.map(opt => (
                                        <div key={opt} className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                                            {opt}
                                            <button type="button" onClick={() => removeOption(opt)} className="hover:bg-violet-200 p-0.5 rounded-full text-violet-500 hover:text-violet-800 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 rounded-xl h-12 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] text-[15px] mt-2">
                            {editingId ? 'Actualizar Variable' : 'Crear Variable'}
                        </Button>
                    </form>
                </Card>

                <div className="md:col-span-2 space-y-6 text-foreground">
                    <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Variables Existentes</h2>
                    {loading ? (
                        <div className="text-muted-foreground animate-pulse">Cargando...</div>
                    ) : variables.length === 0 ? (
                        <div className="text-muted-foreground bg-card p-12 rounded-2xl border border-border shadow-sm text-center flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center text-violet-500 text-2xl mb-2">📦</div>
                            <p className="text-lg">No hay variables registradas.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-5">
                            {variables.map(v => (
                                <Card key={v.id} className={`p-6 bg-card border-border hover:border-violet-300 flex flex-col gap-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative group ${editingId === v.id ? 'ring-2 ring-violet-500 border-transparent' : ''}`}>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-full"
                                            onClick={() => editVariable(v)}
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                                            onClick={() => setVariableToDelete(v.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 pr-16">
                                        <h3 className="font-bold text-lg text-violet-700 dark:text-violet-400 leading-tight">{v.label}</h3>
                                        <span className="text-[11px] font-bold px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full uppercase tracking-wider shrink-0">
                                            {v.category}
                                        </span>
                                    </div>
                                    <div className="text-sm text-foreground font-mono bg-muted border border-border p-3 rounded-xl whitespace-pre-wrap leading-relaxed line-clamp-3">
                                        {v.content}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!variableToDelete} onOpenChange={(open) => !open && setVariableToDelete(null)}>
                <DialogContent className="bg-card border-border rounded-2xl shadow-xl text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground">¿Estás seguro?</DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-3">
                            Esta acción eliminará permanentemente la variable. Si algún prompt la está usando, es posible que no funcione correctamente la próxima vez que se ejecute.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-3">
                        <Button variant="outline" onClick={() => setVariableToDelete(null)} className="border-border hover:bg-muted rounded-lg font-medium text-foreground">Cancelar</Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md">Sí, eliminar variable</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
