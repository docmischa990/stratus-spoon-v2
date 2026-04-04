'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EditRecipePage } from '@/views/recipes/EditRecipePage'

export default function Page() {
  return (
    <ProtectedRoute>
      <EditRecipePage />
    </ProtectedRoute>
  )
}
