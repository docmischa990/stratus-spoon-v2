'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ProfilePage } from '@/views/profile/ProfilePage'

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
