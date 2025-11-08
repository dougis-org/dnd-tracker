import type { LayoutProps } from '@/types/common'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function MainLayout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-backdrop-filter:bg-white/90 dark:supports-backdrop-filter:bg-slate-900/90">
        <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="font-bold text-lg text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              D&D Tracker
            </a>
          </div>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
