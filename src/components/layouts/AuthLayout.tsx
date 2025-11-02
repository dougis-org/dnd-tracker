import type { LayoutProps } from '@/types/common'

export function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">D&D Tracker</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
