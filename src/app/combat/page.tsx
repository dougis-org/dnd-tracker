'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CombatTracker from '@/components/combat/CombatTracker';

function CombatTrackerWrapper() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || 'default-session';

  return <CombatTracker sessionId={sessionId} />;
}

export default function CombatPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading combat tracker...</div>}>
      <CombatTrackerWrapper />
    </Suspense>
  );
}
