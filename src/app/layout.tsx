import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs';
import Layout from '@/components/Layout';
import './globals.css'

export const metadata: Metadata = {
  title: 'D&D Combat Tracker',
  description: 'A comprehensive tool for managing D&D 5e combat encounters',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // During build time, if the env var is missing, use a placeholder
  // At runtime, this will be properly validated by Clerk
  const clerkKey = publishableKey || 'pk_build_placeholder';

  return (
    <ClerkProvider publishableKey={clerkKey}>
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