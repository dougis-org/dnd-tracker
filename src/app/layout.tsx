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
  
  // Fallback test key for build-time use only (not a security risk as it's a public test key)
  const FALLBACK_CLERK_PUBLISHABLE_KEY = 'pk_test_Y2xlcmsuZGV2LmVzc2VudGlhbC1zdGFnLTQ1LmxjbC5kZXYk';

  let clerkKey = publishableKey;

  if (!publishableKey) {
    // During production runtime (not build), throw an error
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      throw new Error(
        'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable in production runtime. Check Fly.io secrets configuration.'
      );
    } 
    
    // For development, show warning about missing key
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        'Warning: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Using fallback test key. Do not use this in production!'
      );
    }
    
    clerkKey = FALLBACK_CLERK_PUBLISHABLE_KEY;
  }

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