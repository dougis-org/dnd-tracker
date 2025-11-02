import type { LayoutProps } from '@/types/common'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/dashboard">
              <span className="font-bold">D&D Tracker</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6">
              <a
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </a>
              <a
                href="/parties"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Parties
              </a>
              <a
                href="/encounters"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Encounters
              </a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  )
}
