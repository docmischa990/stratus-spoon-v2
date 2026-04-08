import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useIsFollowing, useFollowMutation, useUnfollowMutation } from '@/hooks/useSocial'

export function FollowButton({ targetUid }) {
  const { user, isAuthenticated } = useAuth()
  const { data: following, isLoading } = useIsFollowing(targetUid)
  const followMutation = useFollowMutation(targetUid)
  const unfollowMutation = useUnfollowMutation(targetUid)

  if (!isAuthenticated || user?.uid === targetUid) return null

  const isPending = followMutation.isPending || unfollowMutation.isPending

  return (
    <Button
      variant={following ? 'ghost' : 'primary'}
      disabled={isLoading || isPending}
      onClick={() => following ? unfollowMutation.mutate() : followMutation.mutate()}
    >
      {isPending ? '…' : following ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
