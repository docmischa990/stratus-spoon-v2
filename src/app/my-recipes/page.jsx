'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MyRecipesPage } from '@/views/my-recipes/MyRecipesPage'

export default function Page() {
  return (
    <ProtectedRoute>
      <MyRecipesPage />
    </ProtectedRoute>
  )
}
