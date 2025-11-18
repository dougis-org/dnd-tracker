'use client'

import { SubscriptionPage as SubscriptionPageComponent } from '@/components/subscription'
import { ProtectedRouteGuard } from '@/components/auth/ProtectedRouteGuard'

export default function SubscriptionPage() {
  return (
    <ProtectedRouteGuard>
      <SubscriptionPageComponent />
    </ProtectedRouteGuard>
  )
}
