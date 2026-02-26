import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const prompt = await prisma.prompt.findUnique({
            where: { id },
            include: {
                fragments: true,
                versions: {
                    orderBy: { versionNumber: 'desc' },
                }
            }
        });

        if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(prompt);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.prompt.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
    }
}
