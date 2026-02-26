'use client';

import { useState, useEffect, use } from 'react';
import { BuilderLayout } from '@/components/builder/BuilderLayout';

export default function PromptEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<'editor' | 'variables'>('editor');
    const [prompt, setPrompt] = useState<any>(null);

    useEffect(() => {
        // Fetch prompt details
        fetch(`/api/prompts/${id}`)
            .then(res => res.json())
            .then(data => setPrompt(data));
    }, [id]);

    if (!prompt) return <div className="p-8 text-stone-500">Cargando prompt...</div>;

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 overflow-hidden bg-background">
                <BuilderLayout promptId={id} initialPrompt={prompt} />
            </div>
        </div>
    );
}
