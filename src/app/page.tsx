import Link from 'next/link'
import { Shield, Swords, Users, Clock, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/site-header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <SiteHeader />
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="container mx-auto text-center relative">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-dragon-red" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-dragon-red to-dragon-gold bg-clip-text text-transparent">
            D&D Encounter Tracker
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Master your D&D combat encounters with the ultimate digital toolkit.
            Track initiative, manage HP, and orchestrate epic battles with legendary precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="dragon" asChild>
              <Link href="/sign-up">
                Start Free Trial
                <Star className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-dragon-gold mr-2" />
              Free Forever Plan
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-dragon-gold mr-2" />
              No Credit Card Required
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-dragon-gold mr-2" />
              Ready in 2 Minutes
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need for Epic Encounters
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            From character management to real-time combat tracking,
            streamline your D&D sessions with professional-grade tools.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-dragon-red/20 hover:border-dragon-red/40 transition-colors">
              <CardHeader>
                <Users className="h-8 w-8 text-dragon-red mb-2" />
                <CardTitle>Party Management</CardTitle>
                <CardDescription>
                  Organize your adventuring parties with detailed character sheets,
                  stats tracking, and role management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Character stat blocks
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    HP & AC tracking
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Initiative management
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-dragon-red/20 hover:border-dragon-red/40 transition-colors">
              <CardHeader>
                <Swords className="h-8 w-8 text-dragon-red mb-2" />
                <CardTitle>Combat Tracking</CardTitle>
                <CardDescription>
                  Real-time initiative tracking, status effects, and turn management
                  for seamless combat flow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Automatic initiative sorting
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Status effect timers
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Lair action prompts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-dragon-red/20 hover:border-dragon-red/40 transition-colors">
              <CardHeader>
                <Clock className="h-8 w-8 text-dragon-red mb-2" />
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Save and resume encounters, track session history,
                  and manage multiple campaigns effortlessly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Offline capability
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Auto-save progress
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-dragon-gold mr-2" />
                    Campaign templates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Start Your Adventure Today
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Choose the plan that fits your campaign. Upgrade anytime as your adventures grow.
          </p>

          <div className="max-w-md mx-auto">
            <Card className="border-dragon-gold/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-dragon-gold text-dragon-black px-3 py-1 rounded-full text-sm font-semibold">
                  Free Forever
                </span>
              </div>

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Free Adventurer</CardTitle>
                <div className="text-4xl font-bold">$0</div>
                <CardDescription>Perfect for starting your journey</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-dragon-gold mr-3" />
                    1 Party (up to 6 members)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-dragon-gold mr-3" />
                    3 Saved Encounters
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-dragon-gold mr-3" />
                    10 Custom Creatures
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-dragon-gold mr-3" />
                    Real-time Combat Tracking
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-dragon-gold mr-3" />
                    Offline Support
                  </li>
                </ul>

                <Button className="w-full" variant="dragon" asChild>
                  <Link href="/sign-up">
                    Begin Adventure
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Need more? <Link href="/pricing" className="text-dragon-gold hover:underline">
                View all plans
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Master Your Encounters?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Dungeon Masters who trust D&D Encounter Tracker
            to run smoother, more engaging combat sessions.
          </p>

          <Button size="lg" variant="dragon" asChild>
            <Link href="/sign-up">
              Start Free Trial
              <Shield className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}