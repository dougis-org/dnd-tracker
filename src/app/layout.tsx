import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Breadcrumb, Footer, GlobalNav, GlobalNavMobile } from '@/components'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'D&D Tracker - Combat Encounter Manager',
  description: 'Manage your D&D combat encounters with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, 'bg-background text-foreground antialiased')}
        style={{ '--primary-nav-height': '4.5rem' } as CSSProperties}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-1/2 focus:-translate-x-1/2 focus:translate-y-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Skip to main content
          </a>
          <div className="flex min-h-screen flex-col">
            <header className="relative z-40 border-b bg-background">
              <div className="container relative z-50 flex items-center justify-between gap-4 py-4">
                <GlobalNav />
                <GlobalNavMobile />
              </div>
              <div className="container relative z-30 py-2">
                <Breadcrumb />
              </div>
            </header>
            <main id="main-content" className="container relative z-0 flex-1 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
