import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const fragments = await prisma.fragment.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(fragments);
    } catch (error) {
        console.error('Error fetching fragments:', error);
        return NextResponse.json({ error: 'Failed to fetch fragments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { label, content, category } = await request.json();

        if (!label || !content || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newFragment = await prisma.fragment.create({
            data: {
                label,
                content,
                category,
            },
        });

        return NextResponse.json(newFragment, { status: 201 });
    } catch (error) {
        console.error('Error creating fragment:', error);
        return NextResponse.json({ error: 'Failed to create fragment' }, { status: 500 });
    }
}
