import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // @ts-ignore
        const settings = await prisma.userSetting.findMany();
        const settingsMap = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { key, value } = await request.json();

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
        }

        // @ts-ignore
        const setting = await prisma.userSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        return NextResponse.json(setting);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }
}
