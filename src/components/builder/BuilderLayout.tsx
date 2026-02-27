'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import { FragmentSidebar } from './FragmentSidebar';
import { PromptEditor } from './PromptEditor';
import { VariablesPanel } from './VariablesPanel';
import { AiConfigPanel } from './AiConfigPanel';
import { ExecutionHistory } from '../executions/ExecutionHistory';
import { useLanguage } from '@/context/LanguageContext';

interface BuilderLayoutProps {
    promptId: string;
    initialPrompt: any;
}

export function BuilderLayout({ promptId, initialPrompt }: BuilderLayoutProps) {
    const { language, t } = useLanguage();
    const [promptData, setPromptData] = useState(initialPrompt);

    useEffect(() => {
        // Refetch prompt data to ensure we have the latest fragments when switching back to editor
        fetch(`/api/prompts/${promptId}`)
            .then(res => res.json())
            .then(data => setPromptData(data));
    }, [promptId]);

    const latestVersion = promptData?.versions?.[0];
    const initialText = latestVersion?.templateText || '';

    const [templateText, setTemplateText] = useState(initialText);
    const [variables, setVariables] = useState<string[]>([]);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});

    const [activeDragData, setActiveDragData] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Listen for reuse-version event from ExecutionHistory
    useEffect(() => {
        const handleReuse = (e: CustomEvent) => {
            const version = e.detail;
            if (version && version.templateText) {
                // Determine values to restore
                // Use the latest execution's variables if available for a smoother reuse experience
                let restoredValues: Record<string, string> | null = null;
                if (version.executions && version.executions.length > 0) {
                    restoredValues = version.executions[0].variablesUsed;
                }

                // Call handleTemplateChange to parse new variables
                handleTemplateChange(version.templateText);

                // If we have previous values, restore them after a tiny delay so state settles
                if (restoredValues) {
                    setTimeout(() => setVariableValues(prev => ({ ...prev, ...restoredValues })), 50);
                }
            }
        };

        window.addEventListener('reuse-version', handleReuse as EventListener);
        return () => window.removeEventListener('reuse-version', handleReuse as EventListener);
    }, []);

    const [pendingDragData, setPendingDragData] = useState<any>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragData(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragData(null);
        const { over, active } = event;
        if (over && over.id === 'editor-drop-zone') {
            const data = active.data.current;
            if (data) {
                // Always show modal for consistency, even if it's not a list
                setPendingDragData(data);
            }
        }
    };

    const insertTextFromFragment = (data: any, selectedFromModal?: string) => {
        const option = selectedFromModal || data.selectedOption;
        // If it's a list, we use label.option. 
        // If it's a string fragment, we use label.content (the user requested variable.string)
        const textToInsert = data.isList
            ? `{{${data.label}.${option}}}`
            : `{{${data.label}.${data.content}}}`;

        const textarea = document.getElementById('prompt-editor-textarea') as HTMLTextAreaElement;
        if (textarea) {
            const cursorPos = textarea.selectionStart ?? templateText.length;
            const textBefore = templateText.substring(0, cursorPos);
            const textAfter = templateText.substring(cursorPos);

            const newText = textBefore + textToInsert + textAfter;
            handleTemplateChange(newText);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(cursorPos + textToInsert.length, cursorPos + textToInsert.length);
            }, 0);
        } else {
            handleTemplateChange(templateText + (templateText.endsWith(' ') || templateText === '' ? '' : ' ') + textToInsert);
        }
        setPendingDragData(null);
    };

    // Sync templateText when promptData arrives (initial load)
    useEffect(() => {
        const textToSync = promptData?.versions?.[0]?.templateText;
        if (textToSync) {
            handleTemplateChange(textToSync);
        } else if (templateText) {
            handleTemplateChange(templateText);
        }
    }, [promptData?.id]); // Trigger on mount or when prompt changes

    const handleTemplateChange = (newText: string) => {
        setTemplateText(newText);

        const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
        const matches = Array.from(newText.matchAll(regex)).map(m => m[1].trim());
        const uniqueVars = Array.from(new Set(matches));

        setVariables(uniqueVars);

        setVariableValues(prev => {
            const next: Record<string, string> = {};
            uniqueVars.forEach(v => {
                // Try to find a direct match or a dotted match (label.option)
                let defaultValue = prev[v] !== undefined ? prev[v] : '';

                if (!defaultValue) {
                    // Split if it's like "tono.tranquilo"
                    const [label, option] = v.includes('.') ? v.split('.') : [v, null];
                    const fragment = promptData?.fragments?.find((f: any) => f.label.toLowerCase() === label.toLowerCase());

                    if (fragment) {
                        if (option) {
                            // If user typed {{tono.tranquilo}}, and fragment is tono, use "tranquilo" as value
                            defaultValue = option;
                        } else if (fragment.isList) {
                            defaultValue = fragment.selectedOption || (fragment.options[0] || '');
                        } else {
                            defaultValue = fragment.content || '';
                        }
                    }
                }

                next[v] = defaultValue;
            });
            return next;
        });
    };

    const SelectionModal = () => {
        if (!pendingDragData) return null;

        const options = (pendingDragData.isList ? pendingDragData.options : [pendingDragData.label]) || [];

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in duration-200">
                    <h3 className="text-lg font-bold mb-4">
                        {pendingDragData.isList
                            ? (language === 'es' ? `Seleccionar opción para "${pendingDragData.label}"` : `Select option for "${pendingDragData.label}"`)
                            : (language === 'es' ? `Insertar "${pendingDragData.label}"` : `Insert "${pendingDragData.label}"`)}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => insertTextFromFragment(pendingDragData, pendingDragData.isList ? opt : undefined)}
                                className="p-4 text-left border-2 border-border rounded-xl hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all flex flex-col gap-1 group"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-violet-500">
                                    {pendingDragData.isList
                                        ? (language === 'es' ? 'Opción' : 'Option')
                                        : (language === 'es' ? 'Variable Fija' : 'Fixed Variable')}
                                </span>
                                <span className="text-sm font-bold truncate">
                                    {opt}
                                </span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPendingDragData(null)}
                        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground font-medium"
                    >
                        {t.common.cancel}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full overflow-hidden bg-background text-foreground">
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {/* Left Sidebar: Fragments */}
                <div className="w-64 border-r border-border bg-card z-10 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] flex flex-col relative">
                    <FragmentSidebar
                        promptId={promptId}
                        fragments={promptData?.fragments || []}
                        onRefreshData={() => {
                            fetch(`/api/prompts/${promptId}`)
                                .then(res => res.json())
                                .then(data => setPromptData(data));
                        }}
                    />
                </div>

                {/* Center: Editor & Executions */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    <div className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                        <h1 className="text-xl font-bold text-foreground tracking-tight">{language === 'es' ? 'Editor de Prompt' : 'Prompt Editor'}</h1>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                        <PromptEditor
                            value={templateText}
                            onChange={handleTemplateChange}
                        />

                        <div className="mt-8">
                            <ExecutionHistory promptId={promptId} />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Config & Variables */}
                <div className="w-80 border-l border-border bg-card z-10 shadow-[-2px_0_8px_-4px_rgba(0,0,0,0.05)] flex flex-col overflow-y-auto relative">
                    <VariablesPanel
                        variables={variables}
                        values={variableValues}
                        onChange={(key, val) => setVariableValues(prev => ({ ...prev, [key]: val }))}
                        availableFragments={promptData?.fragments || []}
                    />

                    <AiConfigPanel
                        templateText={templateText}
                        variableValues={variableValues}
                        currentPromptId={promptId}
                        onPromptLoaded={() => { }}
                    />
                </div>

                {/* Drag Overlay for smooth following */}
                <DragOverlay dropAnimation={null}>
                    {activeDragData ? (
                        <div className="p-3 bg-white border border-violet-500 shadow-2xl rounded-xl opacity-95 scale-105 pointer-events-none drop-shadow-xl w-48 rotate-[-2deg]">
                            <div className="text-sm font-bold text-violet-700 truncate">
                                {activeDragData.isList && activeDragData.selectedOption ? activeDragData.selectedOption : activeDragData.label}
                            </div>
                            <div className="text-[10px] text-violet-400 mt-1 uppercase tracking-widest font-bold">
                                {activeDragData.isList
                                    ? (language === 'es' ? 'Opción Seleccionada' : 'Selected Option')
                                    : (language === 'es' ? 'Variable' : 'Variable')}
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
                <SelectionModal />
            </DndContext>
        </div>
    );
}
