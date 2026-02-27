'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, History, Boxes, Activity, ArrowRight, Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
    const { language, t } = useLanguage();

    return (
        <div className="flex-1 min-h-full flex flex-col pt-16 px-8 items-center max-w-6xl mx-auto w-full pb-20">
            {/* Header / Hero */}
            <div className="text-center max-w-3xl space-y-6 mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-bold text-sm mb-4 border border-violet-200 shadow-sm">
                    <Sparkles size={16} />
                    <span>{t.home.hero}</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
                    {language === 'es' ? (
                        <>Domina tus <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Prompts</span> al máximo.</>
                    ) : (
                        <>Master your <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Prompts</span> to the max.</>
                    )}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                    {t.home.subtitle}
                </p>

                <div className="pt-8">
                    <Link href="/prompts">
                        <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-xl shadow-violet-500/30 rounded-full px-10 h-16 text-lg font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] gap-3">
                            {t.home.getStarted}
                            <ArrowRight size={20} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Features section */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                <Card className="p-8 bg-card border-border hover:border-violet-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl flex flex-col relative overflow-hidden group">
                    <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/40 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Boxes size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{t.home.features.variables}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                        {t.home.features.variablesDesc}
                    </p>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] transition-opacity duration-500 pointer-events-none"></div>
                </Card>

                <Card className="p-8 bg-card border-border hover:border-violet-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl flex flex-col relative overflow-hidden group">
                    <div className="w-14 h-14 bg-fuchsia-100 dark:bg-fuchsia-900/40 rounded-2xl flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Activity size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{t.home.features.testing}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                        {t.home.features.testingDesc}
                    </p>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fuchsia-200/50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] transition-opacity duration-500 pointer-events-none"></div>
                </Card>

                <Card className="p-8 bg-card border-border hover:border-violet-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl flex flex-col relative overflow-hidden group lg:col-span-1 md:col-span-2">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <History size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{t.home.features.versioning}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                        {t.home.features.versioningDesc}
                    </p>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] transition-opacity duration-500 pointer-events-none"></div>
                </Card>
            </div>

            <div className="mt-20 flex flex-col items-center">
                <div className="text-center text-muted-foreground font-medium text-sm border-t border-border pt-8 mt-12 w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{t.home.contact.title}</span>
                        <span className="text-muted-foreground/60">{t.home.contact.role}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
                        <a href="https://wa.me/51940351180" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                            <MessageCircle size={18} />
                            <span>{t.home.contact.whatsapp}</span>
                        </a>
                        <a href="mailto:gabrielcanepamercado@gmail.com" className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <Mail size={18} />
                            <span>{t.home.contact.email}</span>
                        </a>
                        <a href="https://github.com/gabrielcz6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-stone-900 transition-colors">
                            <Github size={18} />
                            <span>{t.home.contact.github}</span>
                        </a>
                        <a href="https://www.linkedin.com/in/gabrielinteligenciaartificial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                            <Linkedin size={18} />
                            <span>{t.home.contact.linkedin}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
