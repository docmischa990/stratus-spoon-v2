'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useFollowerProfiles, useFollowingProfiles } from '@/hooks/useSocial'

function getInitials(displayName) {
  return displayName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function AvatarCard({ profile, onClose }) {
  const router = useRouter()

  function handleClick() {
    onClose()
    router.push(`/user/${profile.uid}`)
  }

  return (
    <button
      onClick={handleClick}
      className="card-base flex flex-col items-center gap-2 p-4 text-center transition-opacity hover:opacity-80"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-background">
        {getInitials(profile.displayName || 'U')}
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">{profile.displayName || 'User'}</p>
        {profile.username && (
          <p className="text-xs text-text-muted">@{profile.username}</p>
        )}
      </div>
    </button>
  )
}

function UserGrid({ uid, tab, onClose }) {
  const followersQuery = useFollowerProfiles(tab === 'followers' ? uid : null)
  const followingQuery = useFollowingProfiles(tab === 'following' ? uid : null)

  const { data: profiles, isLoading, isError } =
    tab === 'followers' ? followersQuery : followingQuery

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-base animate-pulse p-4">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-surface-muted" />
            <div className="mx-auto h-3 w-20 rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">Could not load users.</p>
    )
  }

  if (!profiles || profiles.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">No users yet.</p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {profiles.map((profile) => (
        <AvatarCard key={profile.uid} profile={profile} onClose={onClose} />
      ))}
    </div>
  )
}

export function FollowListModal({ uid, initialTab, followerCount, followingCount, onClose, isOpen }) {
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-2xl bg-surface p-6 shadow-xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="follow-modal-title"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 id="follow-modal-title" className="text-base font-semibold">Connections</h2>
              <button
                onClick={onClose}
                className="text-xl leading-none text-text-muted transition-opacity hover:opacity-70"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex border-b border-border">
              <button
                className={`px-4 pb-3 text-sm font-medium transition-colors ${
                  tab === 'following'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-muted hover:text-foreground'
                }`}
                onClick={() => setTab('following')}
              >
                Following {followingCount}
              </button>
              <button
                className={`px-4 pb-3 text-sm font-medium transition-colors ${
                  tab === 'followers'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-muted hover:text-foreground'
                }`}
                onClick={() => setTab('followers')}
              >
                Followers {followerCount}
              </button>
            </div>

            {/* Grid */}
            <div className="max-h-80 overflow-y-auto">
              <UserGrid uid={uid} tab={tab} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
