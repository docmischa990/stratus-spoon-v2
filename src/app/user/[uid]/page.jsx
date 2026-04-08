'use client'

import { use } from 'react'
import { PublicProfilePage } from '@/views/user/PublicProfilePage'

export default function Page({ params }) {
  const { uid } = use(params)
  return <PublicProfilePage uid={uid} />
}
