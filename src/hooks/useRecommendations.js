import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/useAuth'
import { getHomepageRecommendations } from '@/services/recommendations/recommendationService'

export function useRecommendations() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['recommendations', user?.uid ?? 'guest'],
    queryFn: getHomepageRecommendations,
  })

  return {
    recommended: query.data?.recommended ?? [],
    trending: query.data?.trending ?? [],
    quickMeals: query.data?.quickMeals ?? [],
    healthy: query.data?.healthy ?? [],
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
  }
}
