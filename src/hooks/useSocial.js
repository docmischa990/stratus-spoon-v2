import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/useAuth'
import {
  followUser,
  unfollowUser,
  isFollowing,
  getPublicProfile,
  getFollowers,
  getFollowing,
} from '@/services/social/followService'

export function usePublicProfile(uid) {
  return useQuery({
    queryKey: ['publicProfile', uid],
    queryFn: () => getPublicProfile(uid),
    enabled: Boolean(uid),
  })
}

export function useIsFollowing(targetUid) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['isFollowing', user?.uid, targetUid],
    queryFn: () => isFollowing(targetUid),
    enabled: Boolean(user?.uid && targetUid && user.uid !== targetUid),
  })
}

export function useFollowers(uid) {
  return useQuery({
    queryKey: ['followers', uid],
    queryFn: () => getFollowers(uid),
    enabled: Boolean(uid),
  })
}

export function useFollowing(uid) {
  return useQuery({
    queryKey: ['following', uid],
    queryFn: () => getFollowing(uid),
    enabled: Boolean(uid),
  })
}

export function useFollowMutation(targetUid) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => followUser(targetUid),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['isFollowing', user?.uid, targetUid] })
      queryClient.setQueryData(['isFollowing', user?.uid, targetUid], true)
    },
    onError: () => {
      queryClient.setQueryData(['isFollowing', user?.uid, targetUid], false)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', user?.uid, targetUid] })
      queryClient.invalidateQueries({ queryKey: ['publicProfile', targetUid] })
      queryClient.invalidateQueries({ queryKey: ['followers', targetUid] })
      queryClient.invalidateQueries({ queryKey: ['following', user?.uid] })
    },
  })
}

export function useUnfollowMutation(targetUid) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => unfollowUser(targetUid),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['isFollowing', user?.uid, targetUid] })
      queryClient.setQueryData(['isFollowing', user?.uid, targetUid], false)
    },
    onError: () => {
      queryClient.setQueryData(['isFollowing', user?.uid, targetUid], true)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', user?.uid, targetUid] })
      queryClient.invalidateQueries({ queryKey: ['publicProfile', targetUid] })
      queryClient.invalidateQueries({ queryKey: ['followers', targetUid] })
      queryClient.invalidateQueries({ queryKey: ['following', user?.uid] })
    },
  })
}

export function useFollowerProfiles(uid) {
  return useQuery({
    queryKey: ['followerProfiles', uid],
    queryFn: async () => {
      const uids = await getFollowers(uid)
      const profiles = await Promise.all(uids.map((id) => getPublicProfile(id)))
      return profiles.filter(Boolean)
    },
    enabled: Boolean(uid),
  })
}

export function useFollowingProfiles(uid) {
  return useQuery({
    queryKey: ['followingProfiles', uid],
    queryFn: async () => {
      const uids = await getFollowing(uid)
      const profiles = await Promise.all(uids.map((id) => getPublicProfile(id)))
      return profiles.filter(Boolean)
    },
    enabled: Boolean(uid),
  })
}
