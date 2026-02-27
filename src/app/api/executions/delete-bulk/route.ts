import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { executionIds } = await req.json();

        if (!executionIds || !Array.isArray(executionIds) || executionIds.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        await prisma.execution.deleteMany({
            where: {
                id: {
                    in: executionIds
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete executions error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
