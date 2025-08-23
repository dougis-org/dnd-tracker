import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">D&D Combat Tracker</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Welcome to your comprehensive D&D 5e combat encounter management tool.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Button Examples</CardTitle>
            <CardDescription>
              Various button variants available in the design system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🎲</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Example</CardTitle>
            <CardDescription>
              Text input component with consistent styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Character name" />
            <Input type="number" placeholder="Level" />
            <Input type="email" placeholder="Player email" />
          </CardContent>
          <CardFooter>
            <Button className="w-full">Save Character</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              This card demonstrates the card component structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cards are versatile containers that can hold various types of content
              including forms, data displays, and action groups.
            </p>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Continue</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}