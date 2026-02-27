import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get(COOKIE_NAME)?.value;
        if (!token) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        const { newPassword } = await req.json();

        if (!newPassword || newPassword.length < 4) {
            return NextResponse.json(
                { error: 'La nueva contraseña debe tener al menos 4 caracteres' },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: payload.userId as string },
            data: {
                passwordHash,
                needsPasswordChange: false
            },
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[auth/change-password]', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
