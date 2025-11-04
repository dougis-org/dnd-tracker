import type { LayoutProps } from '@/types/common'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function MainLayout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen">
      <header
        className="sticky z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{ top: 'var(--primary-nav-height, 4.5rem)' }}
      >
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">D&D Tracker</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center">
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
