import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { TopNav } from '@/components/TopNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import prisma from '@/lib/prisma'


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
    // @ts-ignore
    const themeSetting = await prisma.userSetting.findUnique({
        where: { key: 'theme' }
    });
    const initialTheme = themeSetting?.value || 'light';

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen text-stone-800 flex flex-col`}>
                <ThemeProvider defaultTheme={initialTheme}>
                    <TopNav />
                    <div className="flex-1 flex flex-col min-h-0">
                        {children}
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}

