import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Allow internal Next.js paths, static assets and auth API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth/login') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // 2. Verify JWT token from cookie
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const payload = token ? await verifyToken(token) : null;

    // 3. Define public routes
    const isLoginPage = pathname === '/login';
    const isPublicPath = pathname === '/' || pathname === '/home';
    const isMeApi = pathname === '/api/auth/me';

    // 4. Logic based on auth state

    if (isLoginPage && payload && !payload.needsPasswordChange) {
        return NextResponse.redirect(new URL('/prompts', req.url));
    }

    // Allow public pages, the login page (if not authenticated), and the auth check API
    if (isLoginPage || isPublicPath || isMeApi) {
        return NextResponse.next();
    }

    // 5. Protected routes check
    if (!payload) {
        // If it's an API route (not /api/auth/me which was handled above), return 401
        if (pathname.startsWith('/api/')) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Redirect to login for all other protected pages
        const response = NextResponse.redirect(new URL('/login', req.url));
        if (token) response.cookies.delete(COOKIE_NAME);
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image).*)'],
};
