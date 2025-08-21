import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'D&D Combat Tracker',
  description: 'A comprehensive tool for managing D&D 5e combat encounters',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}