import { ClerkProvider, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Shield, Swords, Users, BookOpen, Settings, Home } from 'lucide-react'
import clerkConfig from '@/lib/auth/clerk-config'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={clerkConfig.publishableKey}>
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-dragon-red" />
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      D&D Tracker
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Encounter Manager
                    </p>
                  </div>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard" className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link href="/parties" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Parties</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link href="/encounters" className="flex items-center space-x-2">
                    <Swords className="h-4 w-4" />
                    <span>Encounters</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link href="/creatures" className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Creatures</span>
                  </Link>
                </Button>
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>

                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                      userButtonPopoverCard: 'bg-card border-border',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-b border-border bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex space-x-1 py-2 overflow-x-auto">
              <Button variant="ghost" size="sm" asChild className="min-w-fit">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild className="min-w-fit">
                <Link href="/parties" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Parties</span>
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild className="min-w-fit">
                <Link href="/encounters" className="flex items-center space-x-2">
                  <Swords className="h-4 w-4" />
                  <span>Encounters</span>
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild className="min-w-fit">
                <Link href="/creatures" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Creatures</span>
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-muted-foreground">
                <p>© 2024 D&D Encounter Tracker. Built for adventurers.</p>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help
                </Link>
                <Link
                  href="/feedback"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feedback
                </Link>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ClerkProvider>
  )
}