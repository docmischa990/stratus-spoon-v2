'use client'

import { useState } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { FollowListModal } from '@/components/social/FollowListModal'

export function ProfileSummary({ profile }) {
  const [modal, setModal] = useState(null)

  return (
    <section className="space-y-4">
      <div className="card-base p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-xl font-semibold text-background">
            {profile.displayName
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{profile.displayName}</h1>
            {profile.username && (
              <p className="text-sm font-medium text-primary">@{profile.username}</p>
            )}
            <p className="text-sm text-text-muted">{profile.email}</p>
          </div>
        </div>
        <p className="mt-5 max-w-prose text-sm leading-7 text-text-muted">{profile.bio}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <button
          onClick={() => setModal('followers')}
          className="cursor-pointer text-left transition-opacity hover:opacity-80"
        >
          <StatCard label="Followers" value={profile.followerCount ?? 0} />
        </button>
        <button
          onClick={() => setModal('following')}
          className="cursor-pointer text-left transition-opacity hover:opacity-80"
        >
          <StatCard label="Following" value={profile.followingCount ?? 0} />
        </button>
        <StatCard label="Created recipes" value={profile.stats.recipes} />
        <StatCard label="Favorites" value={profile.stats.favorites} />
        <StatCard label="Collections" value={profile.stats.collections} />
      </div>

      <FollowListModal
        key={modal}
        uid={profile.uid}
        initialTab={modal ?? 'following'}
        followerCount={profile.followerCount ?? 0}
        followingCount={profile.followingCount ?? 0}
        isOpen={modal !== null}
        onClose={() => setModal(null)}
      />
    </section>
  )
}
