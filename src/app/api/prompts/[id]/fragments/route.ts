import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { fragmentIds } = await request.json();

        if (!Array.isArray(fragmentIds)) {
            return NextResponse.json({ error: 'fragmentIds debe ser un array' }, { status: 400 });
        }

        // Update the prompt by setting its fragments (replaces existing connections)
        const updatedPrompt = await prisma.prompt.update({
            where: { id },
            data: {
                fragments: {
                    set: fragmentIds.map(fid => ({ id: fid }))
                }
            },
            include: {
                fragments: true
            }
        });

        return NextResponse.json(updatedPrompt.fragments);
    } catch (error) {
        console.error('Error linking fragments to prompt:', error);
        return NextResponse.json({ error: 'Failed to update prompt variables' }, { status: 500 });
    }
}
