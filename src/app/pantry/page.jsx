'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PantryPage } from '@/views/pantry/PantryPage'

export default function Page() {
  return (
    <ProtectedRoute>
      <PantryPage />
    </ProtectedRoute>
  )
}
