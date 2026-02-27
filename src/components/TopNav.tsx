'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Database, LayoutTemplate, Home, PlayCircle, Globe, LogOut, LogIn } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export function TopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.ok ? res.json() : null)
            .then(data => setUser(data))
            .catch(() => setUser(null));
    }, [pathname]);

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }

    const routes = [
        {
            href: '/home',
            label: t.nav.home,
            icon: <Home className="w-4 h-4 mr-2" />,
            active: pathname === '/home' || pathname === '/',
            public: true
        },
        {
            href: '/prompts',
            label: t.nav.prompts,
            icon: <LayoutTemplate className="w-4 h-4 mr-2" />,
            active: pathname.startsWith('/prompts'),
            public: false
        },
        {
            href: '/variables',
            label: t.nav.variables,
            icon: <Database className="w-4 h-4 mr-2" />,
            active: pathname.startsWith('/variables'),
            public: false
        },
        {
            href: '/tutorial',
            label: t.nav.tutorial,
            icon: <PlayCircle className="w-4 h-4 mr-2" />,
            active: pathname.startsWith('/tutorial'),
            public: false
        },
    ];

    const visibleRoutes = routes.filter(r => r.public || user);

    return (
        <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mr-4 tracking-tight">Prompt Manager</h1>
                    <nav className="flex items-center gap-2">
                        {visibleRoutes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    'flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-200',
                                    route.active
                                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-semibold shadow-sm'
                                        : 'text-stone-500 dark:text-stone-400 font-medium hover:text-violet-600 hover:bg-stone-50 dark:hover:bg-stone-900'
                                )}
                            >
                                {route.icon}
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        className="h-9 px-3 gap-2 text-xs font-bold uppercase tracking-widest hover:bg-violet-50 dark:hover:bg-violet-900/20 text-muted-foreground hover:text-violet-600 transition-all rounded-xl border border-transparent hover:border-violet-100 dark:hover:border-violet-800"
                    >
                        <Globe size={14} className="text-violet-500" />
                        {language === 'es' ? 'ESP' : 'ENG'}
                    </Button>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <ThemeToggle />

                    {!user && pathname !== '/login' && (
                        <Link href="/login">
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl px-4 h-9 shadow-md gap-2">
                                <LogIn size={14} />
                                {language === 'es' ? 'Ingresar' : 'Login'}
                            </Button>
                        </Link>
                    )}

                    {user && (
                        <>
                            <div className="w-px h-6 bg-border mx-1"></div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner uppercase">
                                    {user.username.substring(0, 2)}
                                </div>
                                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{user.username}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    title="Cerrar sesión"
                                    className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-400 hover:text-red-500 transition-all rounded-lg"
                                >
                                    <LogOut size={14} />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
