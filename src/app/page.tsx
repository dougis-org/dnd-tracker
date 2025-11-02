import { MainLayout } from '@/components/layouts/MainLayout'

export default function Home() {
  return (
    <MainLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold text-center mb-8">
            D&D Tracker
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            Manage your combat encounters with ease
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
