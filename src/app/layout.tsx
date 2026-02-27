import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { TopNav } from '@/components/TopNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import prisma from '@/lib/prisma'


import { LanguageProvider } from '@/context/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Prompt Manager',
    description: 'Design, version and test AI Prompts',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Fetch initial theme from DB if exists
    let initialTheme = 'light';
    try {
        // @ts-ignore
        const themeSetting = await prisma.userSetting.findUnique({
            where: { key: 'theme' }
        });
        initialTheme = themeSetting?.value || 'light';
    } catch (error) {
        console.warn('Could not fetch theme settings, defaulting to light mode.');
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen text-stone-800 flex flex-col`}>
                <ThemeProvider defaultTheme={initialTheme}>
                    <LanguageProvider>
                        <TopNav />
                        <div className="flex-1 flex flex-col min-h-0">
                            {children}
                        </div>
                        <Toaster />
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}

