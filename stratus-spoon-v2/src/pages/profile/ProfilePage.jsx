import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileSummary } from '@/components/profile/ProfileSummary'
import { Button } from '@/components/ui/Button'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useProfile,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
} from '@/hooks/useProfile'

const PREFERENCE_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'high-protein',
  'low-carb',
  'dairy-free',
]

export function ProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, isError } = useProfile()
  const updateProfile = useUpdateProfileMutation()
  const updatePreferences = useUpdatePreferencesMutation()
  const changePassword = useChangePasswordMutation()
  const deleteAccount = useDeleteAccountMutation()

  const [displayName, setDisplayName] = useState(null)
  const [bio, setBio] = useState(null)
  const [profileMessage, setProfileMessage] = useState('')

  const [preferenceMessage, setPreferenceMessage] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMessage, setDeleteMessage] = useState('')

  const currentDisplayName = displayName ?? profile?.displayName ?? ''
  const currentBio = bio ?? profile?.bio ?? ''
  const dietaryTags = profile?.preferences?.dietaryTags ?? []

  function toggleDietaryTag(tag) {
    if (!profile) {
      return
    }

    const nextDietaryTags = dietaryTags.includes(tag)
      ? dietaryTags.filter((entry) => entry !== tag)
      : [...dietaryTags, tag]

    setPreferenceMessage('')
    updatePreferences.mutate(
      {
        dietaryTags: nextDietaryTags,
        theme: profile.preferences?.theme ?? 'warm',
      },
      {
        onSuccess: () => {
          setPreferenceMessage('Preferences saved.')
        },
        onError: (error) => {
          setPreferenceMessage(error.message || 'Unable to save your preferences.')
        },
      },
    )
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setProfileMessage('')

    try {
      await updateProfile.mutateAsync({
        displayName: currentDisplayName,
        bio: currentBio,
      })
      setProfileMessage('Profile updated.')
    } catch (error) {
      setProfileMessage(error.message || 'Unable to update your profile.')
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordMessage('')

    try {
      await changePassword.mutateAsync({
        currentPassword,
        nextPassword,
      })
      setCurrentPassword('')
      setNextPassword('')
      setPasswordMessage('Password updated.')
    } catch (error) {
      setPasswordMessage(error.message || 'Unable to update your password.')
    }
  }

  async function handleDeleteAccount(event) {
    event.preventDefault()
    setDeleteMessage('')

    try {
      await deleteAccount.mutateAsync({ currentPassword: deletePassword })
      navigate('/', { replace: true })
    } catch (error) {
      setDeleteMessage(error.message || 'Unable to delete your account.')
    }
  }

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Profile"
          title="Account settings and personal preferences"
          description="Keep your account details current, choose your recipe preferences, and manage security from one calm workspace."
        />

        {isLoading ? (
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading your profile…</p>
          </div>
        ) : isError || !profile ? (
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold">Profile unavailable</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Check your Firebase authentication and Firestore profile document, then try again.
            </p>
          </div>
        ) : (
          <>
            <ProfileSummary profile={profile} />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="card-base p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account Info</p>
                <form className="mt-4 space-y-4" onSubmit={handleProfileSubmit}>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-primary-dark">Display name</span>
                    <input
                      className="input-base"
                      value={currentDisplayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-primary-dark">Email</span>
                    <input className="input-base bg-surface-muted/70" value={profile.email} disabled />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-primary-dark">Bio</span>
                    <textarea
                      className="input-base min-h-28"
                      value={currentBio}
                      onChange={(event) => setBio(event.target.value)}
                    />
                  </label>
                  {profileMessage ? <p className="text-sm text-text-muted">{profileMessage}</p> : null}
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save profile'}
                  </Button>
                </form>
              </section>

              <section className="card-base p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Preferences</p>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Dietary preference toggles</h2>
                    <p className="text-sm leading-6 text-text-muted">
                      Use these toggles to keep your profile aligned with the kinds of recipes you prefer to browse first.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCE_OPTIONS.map((tag) => {
                      const isActive = dietaryTags.includes(tag)

                      return (
                        <Button
                          key={tag}
                          type="button"
                          variant={isActive ? 'secondary' : 'ghost'}
                          className="capitalize"
                          disabled={updatePreferences.isPending}
                          onClick={() => toggleDietaryTag(tag)}
                        >
                          {tag}
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-sm text-text-muted">
                    Current theme preference: <span className="font-semibold text-primary-dark">{profile.preferences?.theme ?? 'warm'}</span>
                  </p>
                  {preferenceMessage ? <p className="text-sm text-text-muted">{preferenceMessage}</p> : null}
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="card-base p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Security</p>
                <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-primary-dark">Current password</span>
                    <input
                      type="password"
                      className="input-base"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-primary-dark">New password</span>
                    <input
                      type="password"
                      className="input-base"
                      value={nextPassword}
                      onChange={(event) => setNextPassword(event.target.value)}
                    />
                  </label>
                  {passwordMessage ? <p className="text-sm text-text-muted">{passwordMessage}</p> : null}
                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending ? 'Updating…' : 'Change password'}
                  </Button>
                </form>
              </section>

              <section className="card-base border border-danger/30 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-danger">Danger Zone</p>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Delete account</h2>
                    <p className="text-sm leading-6 text-text-muted">
                      This removes your profile, favorites, folders, and user-owned recipes from the current app account.
                    </p>
                  </div>
                  <form className="space-y-4" onSubmit={handleDeleteAccount}>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-primary-dark">Current password</span>
                      <input
                        type="password"
                        className="input-base"
                        value={deletePassword}
                        onChange={(event) => setDeletePassword(event.target.value)}
                      />
                    </label>
                    {deleteMessage ? <p className="text-sm text-danger">{deleteMessage}</p> : null}
                    <Button type="submit" variant="ghost" disabled={deleteAccount.isPending}>
                      {deleteAccount.isPending ? 'Deleting…' : 'Delete account'}
                    </Button>
                  </form>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </PageSection>
  )
}
