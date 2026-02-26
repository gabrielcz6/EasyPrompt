import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let models = await prisma.aiModel.findMany({
            orderBy: { createdAt: 'asc' }
        });

        if (models.length === 0) {
            // Seed defaults if empty
            const defaultModels = [
                { name: 'gpt-5.2', isDefault: true },
                { name: 'gpt-5.1', isDefault: false },
                { name: 'gpt-5', isDefault: false },
                { name: 'gpt-4o', isDefault: false },
                { name: 'gpt-4o-mini', isDefault: false },
            ];

            await prisma.aiModel.createMany({
                data: defaultModels
            });

            models = await prisma.aiModel.findMany({
                orderBy: { createdAt: 'asc' }
            });
        }

        return NextResponse.json(models);
    } catch (error) {
        console.error("Error fetching or seeding models:", error);
        return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }
}
