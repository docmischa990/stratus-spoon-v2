'use client'

import { AppProviders } from '@/app/providers/AppProviders'

export function NextProviders({ children }) {
  return <AppProviders>{children}</AppProviders>
}
