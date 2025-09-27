import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'D&D Encounter Tracker',
  description: 'MVP D&D Encounter Tracker for managing combat sessions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}