import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { label, category, content } = await request.json();

        const fragment = await prisma.fragment.update({
            where: { id },
            data: { label, category, content }
        });

        return NextResponse.json(fragment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update fragment' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.fragment.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete fragment' }, { status: 500 });
    }
}
