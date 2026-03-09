import { useQuery } from '@tanstack/react-query'
import { getCurrentProfile } from '@/services/profiles/profileService'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getCurrentProfile,
  })
}
