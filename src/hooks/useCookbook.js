import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addRecipeToCollection,
  createCollection,
  deleteCollection,
  getCookbookSummary,
  isRecipeFavorited,
  removeRecipeFromCollection,
  removeFavorite,
  saveFavorite,
  updateCollection,
} from '@/services/cookbook/cookbookService'
import {
  trackFavoriteAdded,
  trackFavoriteRemoved,
  trackCollectionCreated,
  trackRecipeAddedToCollection,
  trackRecipeRemovedFromCollection,
} from '@/services/analytics/analyticsService'

function patchCollections(collections, collectionId, updater) {
  if (!Array.isArray(collections)) {
    return collections
  }

  return collections.map((collection) =>
    collection.id === collectionId ? updater(collection) : collection,
  )
}

export function useCookbook() {
  return useQuery({
    queryKey: ['cookbook'],
    queryFn: getCookbookSummary,
  })
}

export function useFavoriteStatus(recipeId, options = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ['favorite-status', recipeId],
    queryFn: () => isRecipeFavorited(recipeId),
    enabled: Boolean(recipeId) && enabled,
  })
}

export function useToggleFavorite(recipe) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (isFavorited) => {
      if (isFavorited) {
        await removeFavorite(recipe.id)
        return false
      }

      await saveFavorite(recipe)
      return true
    },
    onMutate: async (isFavorited) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['cookbook'] }),
        queryClient.cancelQueries({ queryKey: ['profile'] }),
      ])

      const previousCookbook = queryClient.getQueryData(['cookbook'])
      const previousProfile = queryClient.getQueryData(['profile'])
      const nextValue = !isFavorited

      queryClient.setQueryData(['cookbook'], (current) => {
        if (!current) {
          return current
        }

        const nextFavorites = nextValue
          ? [recipe, ...current.favorites.filter((entry) => entry.id !== recipe.id)]
          : current.favorites.filter((entry) => entry.id !== recipe.id)

        return {
          ...current,
          favorites: nextFavorites,
          favoriteRecipes: nextFavorites,
        }
      })

      queryClient.setQueryData(['profile'], (current) =>
        current
          ? {
              ...current,
              stats: {
                ...current.stats,
                favorites: Math.max(0, current.stats.favorites + (nextValue ? 1 : -1)),
              },
            }
          : current,
      )

      queryClient.setQueryData(['favorite-status', recipe.id], nextValue)

      return { previousCookbook, previousProfile }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(['cookbook'], context.previousCookbook)
      queryClient.setQueryData(['profile'], context.previousProfile)
    },
    onSuccess: (nextValue) => {
      queryClient.setQueryData(['favorite-status', recipe.id], nextValue)

      if (nextValue) {
        trackFavoriteAdded({ recipeId: recipe.id, recipeTitle: recipe.title })
      } else {
        trackFavoriteRemoved({ recipeId: recipe.id, recipeTitle: recipe.title })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCollection,
    onMutate: async ({ name, description }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['cookbook'] }),
        queryClient.cancelQueries({ queryKey: ['profile'] }),
      ])

      const previousCookbook = queryClient.getQueryData(['cookbook'])
      const previousProfile = queryClient.getQueryData(['profile'])
      const optimisticId = `optimistic-${Date.now()}`

      queryClient.setQueryData(['cookbook'], (current) =>
        current
          ? {
              ...current,
              collections: [
                {
                  id: optimisticId,
                  name: name.trim(),
                  description: description.trim(),
                  recipeCount: 0,
                  recipes: [],
                },
                ...current.collections,
              ],
            }
          : current,
      )

      queryClient.setQueryData(['profile'], (current) =>
        current
          ? {
              ...current,
              stats: {
                ...current.stats,
                collections: current.stats.collections + 1,
              },
            }
          : current,
      )

      return { previousCookbook, previousProfile }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(['cookbook'], context.previousCookbook)
      queryClient.setQueryData(['profile'], context.previousProfile)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })

      trackCollectionCreated({ collectionName: variables.name.trim() })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCollection,
    onMutate: async (collectionId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['cookbook'] }),
        queryClient.cancelQueries({ queryKey: ['profile'] }),
      ])

      const previousCookbook = queryClient.getQueryData(['cookbook'])
      const previousProfile = queryClient.getQueryData(['profile'])

      queryClient.setQueryData(['cookbook'], (current) =>
        current
          ? {
              ...current,
              collections: current.collections.filter((collection) => collection.id !== collectionId),
            }
          : current,
      )

      queryClient.setQueryData(['profile'], (current) =>
        current
          ? {
              ...current,
              stats: {
                ...current.stats,
                collections: Math.max(0, current.stats.collections - 1),
              },
            }
          : current,
      )

      return { previousCookbook, previousProfile }
    },
    onError: (_error, _collectionId, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(['cookbook'], context.previousCookbook)
      queryClient.setQueryData(['profile'], context.previousProfile)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCollection,
    onMutate: async ({ collectionId, name, description }) => {
      await queryClient.cancelQueries({ queryKey: ['cookbook'] })

      const previousCookbook = queryClient.getQueryData(['cookbook'])

      queryClient.setQueryData(['cookbook'], (current) =>
        current
          ? {
              ...current,
              collections: patchCollections(current.collections, collectionId, (collection) => ({
                ...collection,
                name: name.trim(),
                description: description.trim(),
              })),
            }
          : current,
      )

      return { previousCookbook }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(['cookbook'], context.previousCookbook)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

export function useToggleCollectionRecipe(recipe) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ collectionId, isMember, recipeOverride }) => {
      const targetRecipe = recipeOverride ?? recipe

      if (isMember) {
        await removeRecipeFromCollection({ collectionId, recipeId: targetRecipe.id })
        return false
      }

      await addRecipeToCollection({ collectionId, recipe: targetRecipe })
      return true
    },
    onMutate: async ({ collectionId, isMember, recipeOverride }) => {
      await queryClient.cancelQueries({ queryKey: ['cookbook'] })

      const previousCookbook = queryClient.getQueryData(['cookbook'])
      const targetRecipe = recipeOverride ?? recipe

      queryClient.setQueryData(['cookbook'], (current) =>
        current
          ? {
              ...current,
              collections: patchCollections(current.collections, collectionId, (collection) => {
                const nextRecipes = isMember
                  ? collection.recipes.filter((entry) => entry.recipeId !== targetRecipe.id)
                  : [
                      {
                        id: targetRecipe.id,
                        recipeId: targetRecipe.id,
                        recipeSnapshot: {
                          title: targetRecipe.title,
                          imageUrl: targetRecipe.image ?? null,
                          category: targetRecipe.category ?? null,
                        },
                      },
                      ...(collection.recipes ?? []),
                    ]

                return {
                  ...collection,
                  recipeCount: Math.max(0, (collection.recipeCount ?? 0) + (isMember ? -1 : 1)),
                  recipes: nextRecipes,
                }
              }),
            }
          : current,
      )

      return { previousCookbook }
    },
    onSuccess: (nextValue, variables) => {
      const targetRecipe = variables.recipeOverride ?? recipe

      if (nextValue) {
        trackRecipeAddedToCollection({
          recipeId: targetRecipe.id,
          collectionId: variables.collectionId,
        })
      } else {
        trackRecipeRemovedFromCollection({
          recipeId: targetRecipe.id,
          collectionId: variables.collectionId,
        })
      }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(['cookbook'], context.previousCookbook)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}
