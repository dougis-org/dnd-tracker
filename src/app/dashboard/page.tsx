import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Swords, BookOpen, Plus, Star } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Dungeon Master. Ready for your next adventure?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/1</div>
            <p className="text-xs text-muted-foreground">
              parties used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encounters</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/3</div>
            <p className="text-xs text-muted-foreground">
              encounters saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Creatures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/10</div>
            <p className="text-xs text-muted-foreground">
              creatures created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tier</CardTitle>
            <Star className="h-4 w-4 text-dragon-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Free</div>
            <p className="text-xs text-muted-foreground">
              Adventurer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get started with your first D&D session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="dragon">
              <Plus className="mr-2 h-4 w-4" />
              Create Party
            </Button>
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Build Encounter
            </Button>
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Creature
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Free Adventurer</CardTitle>
            <CardDescription>
              Your current subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>1 Party</span>
                <span className="text-muted-foreground">up to 6 members</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>3 Encounters</span>
                <span className="text-muted-foreground">saved encounters</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>10 Creatures</span>
                <span className="text-muted-foreground">custom creatures</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>6 Max Participants</span>
                <span className="text-muted-foreground">per encounter</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Upgrade for More
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>
            Complete these steps to make the most of your D&D Encounter Tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked readOnly className="rounded" />
              <span className="text-sm line-through text-muted-foreground">
                Create your account
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" readOnly className="rounded" />
              <span className="text-sm">
                Create your first party
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" readOnly className="rounded" />
              <span className="text-sm">
                Add characters to your party
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" readOnly className="rounded" />
              <span className="text-sm">
                Build your first encounter
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" readOnly className="rounded" />
              <span className="text-sm">
                Start your first combat session
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}