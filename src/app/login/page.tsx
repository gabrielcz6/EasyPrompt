'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Lock, User, LogIn, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Change Password Modal State
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });


            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión');
                return;
            }

            if (data.needsPasswordChange) {
                setShowChangePassword(true);
                return;
            }

            router.push('/prompts');
            router.refresh();
        } catch {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    }

    async function handlePasswordChange(e: FormEvent) {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            if (res.ok) {
                router.push('/prompts');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al cambiar la contraseña');
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setChangingPassword(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-800 dark:bg-stone-100 mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-stone-100 dark:text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Prompt Manager</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Inicia sesión para continuar</p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                                required
                                autoFocus
                                autoComplete="username"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700
                           bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100
                           placeholder:text-stone-400 dark:placeholder:text-stone-500
                           focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400
                           transition-all duration-150"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700
                           bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100
                           placeholder:text-stone-400 dark:placeholder:text-stone-500
                           focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400
                           transition-all duration-150"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 dark:bg-stone-100
                         text-stone-100 dark:text-stone-800 font-semibold text-sm
                         hover:bg-stone-700 dark:hover:bg-stone-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150 shadow-sm hover:shadow-md
                         flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Verificando…
                                </>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-stone-400 dark:text-stone-600 mt-6">
                    Prompt Manager · Uso interno
                </p>
            </div>

            {/* Force Password Change Modal */}
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogContent className="bg-card border-border text-foreground rounded-2xl shadow-2xl p-0 overflow-hidden max-w-md">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 flex flex-col items-center text-white text-center">
                        <div className="bg-white/20 p-3 rounded-full mb-4 backdrop-blur-sm">
                            <ShieldAlert size={32} />
                        </div>
                        <DialogTitle className="text-xl font-bold uppercase tracking-tight">Acceso Inicial Detectado</DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">Por seguridad, debes cambiar tu contraseña predeterminada antes de continuar.</DialogDescription>
                    </div>

                    <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500 transition-colors" size={18} />
                                    <Input
                                        type="password"
                                        placeholder="Min. 4 caracteres"
                                        className="pl-10 h-12 bg-muted/50 border-border focus:ring-amber-500 rounded-xl"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                                <div className="relative group">
                                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500 transition-colors" size={18} />
                                    <Input
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        className="pl-10 h-12 bg-muted/50 border-border focus:ring-amber-500 rounded-xl"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={changingPassword}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {changingPassword ? 'Actualizando...' : 'Actualizar y Entrar'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
