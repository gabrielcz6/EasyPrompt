import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const prompts = await prisma.prompt.findMany({
            include: {
                versions: {
                    orderBy: { versionNumber: 'desc' },
                    take: 1, // Only get the latest version by default
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(prompts);
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, description, templateText, modelConfig, fragmentIds } = await request.json();

        if (!name || templateText === undefined || !modelConfig) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newPrompt = await prisma.prompt.create({
            data: {
                name,
                description,
                fragments: fragmentIds && fragmentIds.length > 0 ? {
                    connect: fragmentIds.map((id: string) => ({ id }))
                } : undefined,
                versions: {
                    create: {
                        templateText,
                        modelConfig,
                        versionNumber: 1,
                    },
                },
            },
            include: {
                versions: true,
                fragments: true,
            },
        });

        return NextResponse.json(newPrompt, { status: 201 });
    } catch (error) {
        console.error('Error creating prompt:', error);
        return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
    }
}
