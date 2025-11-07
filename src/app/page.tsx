'use client';

import dynamic from 'next/dynamic';
import { NotImplementedPage } from '@/components/NotImplementedPage';

// Dynamic import of landing page with ssr disabled
const LandingPage = dynamic(() => import('@/app/(landing)/page'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>,
});

export default function Home() {
  // Guard: only show landing page in development (NODE_ENV !== 'production')
  const isProduction = process.env.NODE_ENV === 'production';
  const featureLandingEnabled = process.env.NEXT_PUBLIC_FEATURE_LANDING === 'true';

  if (!isProduction && featureLandingEnabled) {
    return <LandingPage />;
  }

  return <NotImplementedPage />;
}
