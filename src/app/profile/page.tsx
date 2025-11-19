'use client'

import ProfilePage from '@/components/profile/ProfilePage'
import { ProtectedRouteGuard } from '@/components/auth/ProtectedRouteGuard'

export default function Page() {
  return (
    <ProtectedRouteGuard>
      <ProfilePage />
    </ProtectedRouteGuard>
  )
}
