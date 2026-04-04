'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CookbookPage } from '@/views/cookbook/CookbookPage'

export default function Page() {
  return (
    <ProtectedRoute>
      <CookbookPage />
    </ProtectedRoute>
  )
}
