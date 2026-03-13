import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeCurrentUserPassword,
  deleteCurrentAuthUser,
  syncAuthDisplayName,
} from '@/services/firebase/authService'
import {
  deleteCurrentUserData,
  getCurrentProfile,
  updateCurrentPreferences,
  updateCurrentProfile,
} from '@/services/profiles/profileService'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getCurrentProfile,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ displayName, bio }) => {
      await syncAuthDisplayName(displayName)
      return updateCurrentProfile({ displayName, bio })
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCurrentPreferences,
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changeCurrentUserPassword,
  })
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ currentPassword }) => {
      await deleteCurrentUserData()
      await deleteCurrentAuthUser({ currentPassword })
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
