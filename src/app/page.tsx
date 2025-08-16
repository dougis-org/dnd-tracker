import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">D&D Encounter Tracker</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Track your D&D encounters, parties, and adventures
        </p>

        <div className="flex gap-4 justify-center">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">✅ Project Foundation</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Next.js 15 with TypeScript</li>
              <li>• NextAuth.js v5 configured</li>
              <li>• MongoDB with Mongoose</li>
              <li>• shadcn/ui components</li>
              <li>• Tailwind CSS with themes</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
