import { lazy, Suspense } from 'react';
import { NotImplementedPage } from '@/components/NotImplementedPage';

// Dynamic import of landing page
const LandingPage = lazy(() => import('@/app/(landing)/page'));

export default function Home() {
  // Guard: only show landing page in development (NODE_ENV !== 'production')
  const isProduction = process.env.NODE_ENV === 'production';
  const featureLandingEnabled = process.env.NEXT_PUBLIC_FEATURE_LANDING === 'true';

  if (!isProduction && featureLandingEnabled) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LandingPage />
      </Suspense>
    );
  }

  return <NotImplementedPage />;
}
