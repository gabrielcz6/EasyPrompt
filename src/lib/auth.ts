import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'prompt-manager-super-secret-key-2025'
);

const COOKIE_NAME = 'auth_token';
const EXPIRES_IN = '7d';

export interface JwtPayload {
    userId: string;
    username: string;
    role: string;
    needsPasswordChange?: boolean;
}

export async function signToken(payload: JwtPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(EXPIRES_IN)
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JwtPayload;
    } catch {
        return null;
    }
}

export { COOKIE_NAME };
