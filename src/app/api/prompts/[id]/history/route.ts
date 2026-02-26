import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const promptId = id;
        if (!promptId) {
            return NextResponse.json({ error: 'Missing prompt ID' }, { status: 400 });
        }

        const versions = await prisma.promptVersion.findMany({
            where: { promptId },
            orderBy: { versionNumber: 'desc' },
            include: {
                executions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        return NextResponse.json(versions);
    } catch (error) {
        console.error('Error fetching prompt history:', error);
        return NextResponse.json({ error: 'Failed to fetch prompt history' }, { status: 500 });
    }
}
