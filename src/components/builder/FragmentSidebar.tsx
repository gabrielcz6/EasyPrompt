import { useState, useEffect } from 'react';
import { Fragment } from '@prisma/client';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical, PlusCircle, Search, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FragmentSidebarProps {
    promptId: string;
    fragments: Fragment[];
    onRefreshData?: () => void;
}

function DraggableFragment({ fragment }: { fragment: Fragment }) {
    const content = fragment.content.trim();
    const isList = content.startsWith('(') && content.endsWith(')') && content.includes('|');
    const options = isList ? content.slice(1, -1).split('|').map(s => s.trim()) : [];
    const [selectedOption, setSelectedOption] = useState(options.length > 0 ? options[0] : '');

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `fragment-${fragment.id}`,
        data: {
            content: fragment.content,
            label: fragment.label,
            isList,
            selectedOption,
            options
        },
    });

    return (
        <Card className={`p-3 mb-3 bg-card border-border shadow-sm transition-all duration-200 hover:shadow-md hover:border-violet-300 ${isDragging ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3">
                <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing hover:bg-muted p-1.5 rounded-md mt-0.5" title="Arrastrar al editor">
                    <GripVertical size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{fragment.label}</div>
                    <div className="text-xs text-muted-foreground mb-2 truncate">{fragment.category}</div>

                    {isList ? (
                        <div onClick={e => e.stopPropagation()} className="pointer-events-auto mt-2">
                            <Select value={selectedOption} onValueChange={setSelectedOption}>
                                <SelectTrigger className="h-8 text-[11px] bg-muted/50 border-border focus:ring-violet-500 w-full truncate font-medium text-foreground rounded-md">
                                    <SelectValue placeholder="Elegir opción..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border z-[100] shadow-xl text-foreground">
                                    {options.map(opt => (
                                        <SelectItem key={opt} value={opt} className="text-[11px] py-1.5 focus:bg-violet-50 dark:focus:bg-violet-900/40 focus:text-violet-700 cursor-pointer rounded-lg mx-1 my-1">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <div className="h-8 flex items-center px-2.5 bg-muted/30 border border-border/50 rounded-md text-[11px] text-muted-foreground/70 font-medium truncate italic italic-none">
                                {fragment.content.length > 30 ? fragment.content.substring(0, 30) + '...' : fragment.content || 'Sin contenido'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

export function FragmentSidebar({ promptId, fragments, onRefreshData }: FragmentSidebarProps) {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [allGlobalFragments, setAllGlobalFragments] = useState<Fragment[]>([]);
    const [selectedFragmentIds, setSelectedFragmentIds] = useState<Set<string>>(new Set());
    const [isLoadingFragments, setIsLoadingFragments] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Update selected fragments when the modal opens or fragments change
    useEffect(() => {
        if (isImportModalOpen && fragments) {
            setSelectedFragmentIds(new Set(fragments.map(f => f.id)));
            loadGlobalFragments();
        }
    }, [isImportModalOpen, fragments]);

    const loadGlobalFragments = async () => {
        setIsLoadingFragments(true);
        try {
            const res = await fetch('/api/fragments');
            const data = await res.json();
            if (Array.isArray(data)) {
                setAllGlobalFragments(data);
            }
        } catch (error) {
            toast.error('Error al cargar variables globales');
        } finally {
            setIsLoadingFragments(false);
        }
    };

    const toggleFragment = async (id: string) => {
        const next = new Set(selectedFragmentIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);

        // Update local state for immediate UI feedback
        setSelectedFragmentIds(next);

        // Auto-save
        setIsSaving(true);
        try {
            const res = await fetch(`/api/prompts/${promptId}/fragments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fragmentIds: Array.from(next) }),
            });
            if (res.ok) {
                if (onRefreshData) onRefreshData();
            } else {
                toast.error('Error al actualizar variables');
                // Revert state on error if needed, but usually better to let user try again
            }
        } catch (error) {
            toast.error('Error de red');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveImports = async () => {
        setIsImportModalOpen(false);
    };

    const filteredFragments = allGlobalFragments.filter(f =>
        f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered fragments by category
    const groupedGlobal = filteredFragments.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {} as Record<string, Fragment[]>);

    // Group current fragments by category
    const groupedCurrent = (fragments || []).reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {} as Record<string, Fragment[]>);

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
                <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Variables Disponibles</h2>
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20 gap-1.5"
                        >
                            <PlusCircle size={14} />
                            Importar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
                        <DialogHeader className="p-6 border-b border-border bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <DialogTitle className="text-xl font-bold text-foreground">Mis Variables</DialogTitle>
                                        {isSaving && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-500 uppercase tracking-tighter animate-pulse">
                                                <div className="w-2 h-2 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                                Guardando...
                                            </div>
                                        )}
                                    </div>
                                    <DialogDescription className="text-muted-foreground mt-1">
                                        Selecciona qué variables globales quieres usar en este prompt. Se guardan automáticamente.
                                    </DialogDescription>
                                </div>
                            </div>
                            <div className="relative mt-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o categoría..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background border-border placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 border-y border-border/50 bg-muted/5 custom-scrollbar">
                            <style jsx>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 8px;
                                    display: block !important;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background-color: rgba(139, 92, 246, 0.3);
                                    border-radius: 20px;
                                    border: 2px solid transparent;
                                    background-clip: content-box;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background-color: rgba(139, 92, 246, 0.5);
                                }
                            `}</style>
                            {isLoadingFragments ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-medium text-muted-foreground">Cargando catálogo...</p>
                                </div>
                            ) : Object.keys(groupedGlobal).length === 0 ? (
                                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border mx-4">
                                    <div className="text-5xl mb-4 grayscale opacity-20">🔍</div>
                                    <p className="text-muted-foreground font-medium">No se encontraron variables.</p>
                                </div>
                            ) : (
                                <div className="space-y-10 pb-4">
                                    {Object.entries(groupedGlobal).map(([category, items]) => (
                                        <div key={category} className="space-y-5">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-600/70 flex items-center gap-3">
                                                <span className="h-px bg-violet-100 dark:bg-violet-900/30 flex-1"></span>
                                                {category}
                                                <span className="h-px bg-violet-100 dark:bg-violet-900/30 flex-1"></span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {items.map(f => {
                                                    const isSelected = selectedFragmentIds.has(f.id);
                                                    return (
                                                        <Card
                                                            key={f.id}
                                                            onClick={() => toggleFragment(f.id)}
                                                            className={`p-5 cursor-pointer transition-all duration-300 border shadow-sm group relative overflow-hidden ${isSelected
                                                                ? 'bg-violet-50/80 dark:bg-violet-900/10 border-violet-400 ring-1 ring-violet-400/20 translate-y-[-2px] shadow-violet-200/50 dark:shadow-none'
                                                                : 'bg-card hover:bg-white dark:hover:bg-muted/30 border-border hover:border-violet-300 hover:shadow-md'
                                                                }`}
                                                        >
                                                            {isSelected && (
                                                                <div className="absolute top-0 right-0 w-8 h-8 bg-violet-500 flex items-center justify-center rounded-bl-xl text-white">
                                                                    <Save className="h-3.5 w-3.5" />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col gap-2">
                                                                <h4 className={`text-[15px] font-bold tracking-tight ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>
                                                                    {f.label}
                                                                </h4>
                                                                <p className="text-[12px] text-muted-foreground/80 line-clamp-3 leading-relaxed italic pr-2">
                                                                    {f.content}
                                                                </p>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="p-5 border-t border-border bg-muted/40 backdrop-blur-md flex items-center justify-end gap-3 z-10 shrink-0">
                            <Button
                                onClick={handleSaveImports}
                                className="bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:opacity-90 text-white shadow-xl shadow-violet-500/30 px-10 py-6 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Listo
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <ScrollArea className="flex-1 p-4 text-foreground">
                {Object.keys(groupedCurrent).length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center mt-4 text-balance bg-muted p-4 rounded-xl border border-border">
                        No has importado variables a este prompt. Usa el botón "Importar" para seleccionar algunas.
                    </div>
                ) : (
                    Object.entries(groupedCurrent).map(([category, items]) => (
                        <div key={category} className="mb-8">
                            <h3 className="text-[11px] font-bold text-violet-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="h-px bg-violet-200 dark:bg-violet-900/30 flex-1"></div>
                                {category}
                                <div className="h-px bg-violet-200 dark:bg-violet-900/30 flex-1"></div>
                            </h3>
                            {items.map(f => (
                                <DraggableFragment key={f.id} fragment={f} />
                            ))}
                        </div>
                    ))
                )}
            </ScrollArea>
        </div>
    );
}
