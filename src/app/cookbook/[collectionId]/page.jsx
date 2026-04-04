'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CookbookFolderPage } from '@/views/cookbook/CookbookFolderPage'

export default function Page() {
  return (
    <ProtectedRoute>
      <CookbookFolderPage />
    </ProtectedRoute>
  )
}
