export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lair-dungeon via-gray-900 to-dragon-black">
      {/* Background pattern for D&D theme */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Header with D&D branding */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            D&D Encounter Tracker
          </h1>
          <p className="text-dragon-gold text-lg">
            Manage your adventures with legendary precision
          </p>
        </div>

        {/* Auth form container */}
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-dragon-gold/20 bg-card/90 backdrop-blur-sm shadow-2xl">
            <div className="p-8">
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Ready to begin your quest?{' '}
            <span className="text-dragon-gold">Adventure awaits!</span>
          </p>
        </div>
      </div>
    </div>
  )
}