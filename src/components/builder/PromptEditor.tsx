'use client';

import React, { ChangeEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import Editor from 'react-simple-code-editor';

interface PromptEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function PromptEditor({ value, onChange }: PromptEditorProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: 'editor-drop-zone',
    });

    const highlightVariables = (text: string) => {
        if (!text) return '';
        const parts = text.split(/(\{\{\s*.*?\s*\}\})/g);

        return parts.map((part, i) => {
            if (/^\{\{\s*.*?\s*\}\}$/.test(part)) {
                return (
                    <span
                        key={i}
                        className="bg-violet-500/15 text-violet-400 font-bold border-b border-violet-500/40 px-0 m-0"
                    >
                        {part}
                    </span>
                );
            }
            return <span key={i} className="px-0 m-0">{part}</span>;
        });
    };

    return (
        <div
            ref={setNodeRef}
            className={`relative w-full h-[450px] rounded-2xl border-2 transition-all duration-300 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-300 ${isOver ? 'border-violet-500 bg-violet-50/20 shadow-violet-200 ring-4 ring-violet-500/20' : 'border-border bg-card hover:border-violet-300'
                }`}
        >
            <div className="absolute inset-0 overflow-auto custom-scrollbar">
                <Editor
                    textareaId="prompt-editor-textarea"
                    value={value}
                    onValueChange={onChange}
                    highlight={code => (
                        <code className="text-foreground whitespace-pre-wrap break-words !font-mono !p-0 !m-0">
                            {highlightVariables(code)}
                        </code>
                    )}
                    padding={24}
                    style={{
                        minHeight: '100%',
                        fontFamily: 'ui-monospace, "JetBrains Mono", "Fira Code", monospace',
                        fontSize: '15px',
                        lineHeight: '24px',
                        backgroundColor: 'transparent',
                        fontVariantLigatures: 'none',
                    }}
                    textareaClassName="editor-textarea focus:outline-none placeholder:text-muted-foreground caret-violet-500 !font-mono !leading-[24px] !m-0 !shadow-none !border-none"
                    preClassName="editor-pre pointer-events-none !font-mono !leading-[24px] !m-0"
                    placeholder="Escribe tu prompt aquí... Usa {{variable}} para insertar datos."
                />
                <style jsx global>{`
                    .editor-textarea {
                        color: transparent !important;
                        -webkit-text-fill-color: transparent !important;
                        font-family: ui-monospace, "JetBrains Mono", "Fira Code", monospace !important;
                        font-size: 15px !important;
                        line-height: 24px !important;
                        letter-spacing: normal !important;
                        word-spacing: normal !important;
                        font-variant-ligatures: none !important;
                        font-feature-settings: "liga" 0 !important;
                        text-rendering: optimizeSpeed !important;
                        background: transparent !important;
                    }
                    .editor-textarea::placeholder {
                        color: #94a3b8 !important;
                        -webkit-text-fill-color: #94a3b8 !important;
                    }
                    .editor-pre {
                        font-family: ui-monospace, "JetBrains Mono", "Fira Code", monospace !important;
                        font-size: 15px !important;
                        line-height: 24px !important;
                        letter-spacing: normal !important;
                        word-spacing: normal !important;
                        font-variant-ligatures: none !important;
                        font-feature-settings: "liga" 0 !important;
                        text-rendering: optimizeSpeed !important;
                    }
                `}</style>
            </div>
        </div>
    );
}
