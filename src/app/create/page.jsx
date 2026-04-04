'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CreateRecipePage } from '@/views/create/CreateRecipePage'

export default function Page() {
  return (
    <ProtectedRoute>
      <CreateRecipePage />
    </ProtectedRoute>
  )
}
