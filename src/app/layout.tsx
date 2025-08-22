import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs';
import Layout from '@/components/Layout';
import { getClerkConfig } from '@/lib/env';
import './globals.css'

export const metadata: Metadata = {
  title: 'D&D Combat Tracker',
  description: 'A comprehensive tool for managing D&D 5e combat encounters',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const clerkConfig = getClerkConfig();
  
  return (
    <ClerkProvider publishableKey={clerkConfig.publishableKey}>
      <html lang="en">
        <body>
          <Layout>
            {children}
          </Layout>
        </body>
      </html>
    </ClerkProvider>
  )
}