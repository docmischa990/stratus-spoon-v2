import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserRating, rateRecipe, removeRating } from '@/services/cookbook/cookbookService'
import { getRecipeStats } from '@/services/recipes/recipeStatsService'
import { useAuth } from '@/context/useAuth'

export function useRating(recipeId) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['rating', recipeId],
    queryFn: () => getUserRating(recipeId),
    enabled: Boolean(recipeId) && isAuthenticated,
  })
}

export function useRecipeStats(recipeId) {
  return useQuery({
    queryKey: ['recipeStats', recipeId],
    queryFn: () => getRecipeStats(recipeId),
    enabled: Boolean(recipeId),
  })
}

export function useRateRecipeMutation(recipeId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rating, previousRating }) => {
      if (rating === null) {
        await removeRating({ recipeId, previousRating })
        return null
      }
      await rateRecipe({ recipeId, rating, previousRating })
      return rating
    },

    onMutate: async ({ rating, previousRating }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['rating', recipeId] }),
        queryClient.cancelQueries({ queryKey: ['recipeStats', recipeId] }),
      ])

      const previousRatingData = queryClient.getQueryData(['rating', recipeId])
      const previousStats = queryClient.getQueryData(['recipeStats', recipeId])

      // Optimistically update the user's rating
      queryClient.setQueryData(['rating', recipeId], rating)

      // Optimistically update the counts
      queryClient.setQueryData(['recipeStats', recipeId], (current) => {
        if (!current) return current
        const next = { ...current }

        // Undo previous rating count
        if (previousRating === 'like') next.likeCount = Math.max(0, next.likeCount - 1)
        if (previousRating === 'dislike') next.dislikeCount = Math.max(0, next.dislikeCount - 1)

        // Apply new rating count
        if (rating === 'like') next.likeCount = next.likeCount + 1
        if (rating === 'dislike') next.dislikeCount = next.dislikeCount + 1

        return next
      })

      return { previousRatingData, previousStats }
    },

    onError: (_error, _variables, context) => {
      if (!context) return
      queryClient.setQueryData(['rating', recipeId], context.previousRatingData)
      queryClient.setQueryData(['recipeStats', recipeId], context.previousStats)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', recipeId] })
      queryClient.invalidateQueries({ queryKey: ['recipeStats', recipeId] })
    },
  })
}
