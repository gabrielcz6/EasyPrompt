import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Find user in DB
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return NextResponse.json(
                { error: 'Credenciales incorrectas' },
                { status: 401 }
            );
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                { error: 'Credenciales incorrectas' },
                { status: 401 }
            );
        }

        // Sign JWT
        const token = await signToken({
            userId: user.id,
            username: user.username,
            role: user.role,
            needsPasswordChange: user.needsPasswordChange,
        });

        const response = NextResponse.json(
            {
                ok: true,
                username: user.username,
                role: user.role,
                needsPasswordChange: user.needsPasswordChange
            },
            { status: 200 }
        );

        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('[auth/login]', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
