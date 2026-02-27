'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';

interface VariablesPanelProps {
    variables: string[];
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
    availableFragments?: { label: string, content: string }[];
}

export function VariablesPanel({ variables, values, onChange, availableFragments }: VariablesPanelProps) {
    const { language, t } = useLanguage();
    return (
        <div className="flex flex-col border-b border-border bg-transparent">
            <div className="p-4 border-b border-border bg-card/50">
                <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-1">{language === 'es' ? 'Valores de Variables' : 'Variable Values'}</h2>
            </div>
            <ScrollArea className="max-h-[300px] p-5">
                <div className="flex flex-col gap-5">
                    {variables.length === 0 ? (
                        <div className="text-sm text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border border-dashed text-center text-balance leading-relaxed">
                            {language === 'es' ? 'No se detectaron variables aún. Usa ' : 'No variables detected yet. Use '}
                            <code className="text-violet-600 dark:text-violet-400 font-bold">{'{{variable}}'}</code>
                            {language === 'es' ? ' en el editor para que aparezcan aquí.' : ' in the editor to make them appear here.'}
                        </div>
                    ) : (
                        variables.map((v) => {
                            const fragment = availableFragments?.find(f => f.label === v);
                            let options: string[] | null = null;

                            if (fragment?.content) {
                                const content = fragment.content.trim();
                                if (content.startsWith('(') && content.endsWith(')') && content.includes('|')) {
                                    options = content.slice(1, -1).split('|').map(s => s.trim());
                                }
                            }

                            return (
                                <div key={v} className={`group relative flex flex-col gap-2.5 p-4 bg-card/40 border rounded-xl transition-all shadow-sm ${!fragment ? 'border-amber-200 bg-amber-50/10 dark:border-amber-900/40' : 'border-border hover:border-violet-300'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`var-${v}`} className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] ml-0.5">{v}</Label>
                                        </div>
                                        {fragment && (
                                            <span className="text-[8px] font-bold text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                                {language === 'es' ? 'Variable del Catálogo' : 'Catalog Variable'}
                                            </span>
                                        )}
                                    </div>
                                    {options ? (
                                        <Select value={values[v] || ''} onValueChange={(val) => onChange(v, val)}>
                                            <SelectTrigger id={`var-${v}`} className="w-full bg-background border-border text-foreground focus:ring-violet-500 rounded-lg h-9 text-xs font-semibold tracking-tight shadow-none hover:bg-muted/30 transition-colors">
                                                <SelectValue placeholder={language === 'es' ? `Seleccionar ${v}...` : `Select ${v}...`} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-lg z-[100]">
                                                {options.map(opt => (
                                                    <SelectItem key={opt} value={opt} className="focus:bg-violet-50 dark:focus:bg-violet-900/40 focus:text-violet-700 cursor-pointer rounded-lg mx-1 my-1 text-xs">
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id={`var-${v}`}
                                            value={values[v] || ''}
                                            onChange={(e) => onChange(v, e.target.value)}
                                            placeholder={fragment?.content || (language === 'es' ? `Valor para ${v}...` : `Value for ${v}...`)}
                                            className="h-9 bg-background border-border text-xs font-semibold focus-visible:ring-violet-500 rounded-lg"
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
