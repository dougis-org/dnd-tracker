'use client';

import { NotImplementedPage } from '@/components/NotImplementedPage';

export default function Home() {
  // Guard: only show landing page in development (NODE_ENV !== 'production')
  const isProduction = process.env.NODE_ENV === 'production';
  const featureLandingEnabled = process.env.NEXT_PUBLIC_FEATURE_LANDING === 'true';

  if (!isProduction && featureLandingEnabled) {
    // Dynamically import landing page to avoid build issues in production
    const LandingPage = require('@/app/(landing)/page').default;
    return <LandingPage />;
  }

  return <NotImplementedPage />;
}
