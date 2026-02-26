import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import mustache from 'mustache';
import OpenAI from 'openai';

// This is a dummy initialization. Production will read process.env.OPENAI_API_KEY
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

export async function POST(request: Request) {
    try {
        const { promptId, templateText, modelConfig, variablesUsed } = await request.json();

        if (!promptId || !templateText || !modelConfig || !variablesUsed) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Replace {{variables}} with actual values
        let renderedPrompt = templateText;

        // Robust replacement: match all {{tags}} and try to find a key in variablesUsed
        renderedPrompt = templateText.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match: string, key: string) => {
            const trimmedKey = key.trim();
            // Try exact match first
            if (variablesUsed[trimmedKey] !== undefined) {
                return variablesUsed[trimmedKey];
            }
            // Try case-insensitive match
            const caseInsensitiveKey = Object.keys(variablesUsed).find(
                k => k.toLowerCase() === trimmedKey.toLowerCase()
            );
            if (caseInsensitiveKey && variablesUsed[caseInsensitiveKey] !== undefined) {
                return variablesUsed[caseInsensitiveKey];
            }
            return match; // Keep as is if no match found
        });

        // Debug logging
        console.log('--- EXECUTION DEBUG ---');
        console.log('Original Template:', templateText.substring(0, 50));
        console.log('Variables Used Keys:', Object.keys(variablesUsed));
        console.log('Rendered Final:', renderedPrompt.substring(0, 50));
        console.log('-----------------------');

        // Get current latest version to check for changes
        const latestVersion = await prisma.promptVersion.findFirst({
            where: { promptId },
            orderBy: { versionNumber: 'desc' },
        });

        let currentVersionId = latestVersion?.id;
        let versionNumber = latestVersion?.versionNumber || 0;

        // Check if configuration or template has changed
        const hasChanged = !latestVersion ||
            latestVersion.templateText !== templateText ||
            JSON.stringify(latestVersion.modelConfig) !== JSON.stringify(modelConfig);

        if (hasChanged) {
            versionNumber += 1;
            const newVersion = await prisma.promptVersion.create({
                data: {
                    promptId,
                    templateText,
                    modelConfig,
                    versionNumber,
                },
            });
            currentVersionId = newVersion.id;
        }

        if (!currentVersionId) {
            return NextResponse.json({ error: 'Failed to establish version' }, { status: 500 });
        }

        // Mock API call timer
        const startTime = Date.now();
        let aiOutput = '';
        let tokensTotal = 0;

        // Real execution against OpenAI
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'Falta configurar OPENAI_API_KEY en el servidor' }, { status: 500 });
        }

        const requestedMaxTokens = modelConfig.max_tokens !== undefined ? parseInt(modelConfig.max_tokens) : 2000;
        const safeMaxTokens = Math.min(requestedMaxTokens, 4096);

        const response = await openai.chat.completions.create({
            model: modelConfig.model || 'gpt-4o',
            temperature: modelConfig.temperature !== undefined ? parseFloat(modelConfig.temperature) : 0.7,
            max_completion_tokens: safeMaxTokens,
            messages: [{ role: 'user', content: renderedPrompt }],
        });

        aiOutput = response.choices[0]?.message?.content || '';
        tokensTotal = response.usage?.total_tokens || 0;

        const latencyMs = Date.now() - startTime;

        // Log the execution
        const execution = await prisma.execution.create({
            data: {
                versionId: currentVersionId,
                variablesUsed,
                renderedPrompt,
                aiOutput,
                latencyMs,
                tokensTotal,
            },
            include: {
                version: true,
            }
        });

        return NextResponse.json({
            execution,
            hasChanged, // True if a new version was created automatically
            newVersionNumber: hasChanged ? versionNumber : undefined
        }, { status: 201 });

    } catch (error) {
        console.error('Error executing prompt:', error);
        return NextResponse.json({ error: 'Failed to execute prompt' }, { status: 500 });
    }
}
