import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  importExternalRecipe,
  listRecipes,
  updateRecipe,
} from '@/services/recipes/recipeService'

function patchRecipeInList(recipes, recipeId, updater) {
  if (!Array.isArray(recipes)) {
    return recipes
  }

  return recipes.map((recipe) => (recipe.id === recipeId ? updater(recipe) : recipe))
}

export function useRecipes({ searchQuery = '', filters = {} } = {}) {
  return useInfiniteQuery({
    queryKey: ['recipes', searchQuery, filters],
    queryFn: ({ pageParam = 0 }) => listRecipes({ searchQuery, filters, externalOffset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.nextOffset : undefined),
  })
}

export function useRecipe(recipeId) {
  return useQuery({
    queryKey: ['recipes', recipeId],
    queryFn: () => getRecipeById(recipeId),
    enabled: Boolean(recipeId),
    retry: false,
  })
}

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: async (recipeId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recipes'] }),
        queryClient.invalidateQueries({ queryKey: ['cookbook'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations'] }),
      ])

      return recipeId
    },
  })
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRecipe,
    onMutate: async ({ recipeId, formValues }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['recipes'] }),
        queryClient.cancelQueries({ queryKey: ['recipes', recipeId] }),
        queryClient.cancelQueries({ queryKey: ['cookbook'] }),
      ])

      const previousRecipes = queryClient.getQueryData(['recipes'])
      const previousRecipe = queryClient.getQueryData(['recipes', recipeId])
      const previousCookbook = queryClient.getQueryData(['cookbook'])

      queryClient.setQueryData(['recipes'], (current) =>
        patchRecipeInList(current, recipeId, (recipe) => ({
          ...recipe,
          title: formValues.title.trim(),
          description: formValues.description.trim(),
          category: formValues.category,
          tags: formValues.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          notes: formValues.notes.trim(),
          ingredients: formValues.ingredients
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          steps: formValues.steps
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        })),
      )

      queryClient.setQueryData(['recipes', recipeId], (current) =>
        current
          ? {
              ...current,
              title: formValues.title.trim(),
              description: formValues.description.trim(),
              category: formValues.category,
              tags: formValues.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
              notes: formValues.notes.trim(),
              ingredients: formValues.ingredients
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean),
              steps: formValues.steps
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : current,
      )

      queryClient.setQueryData(['cookbook'], (current) =>
        current
          ? {
              ...current,
              createdRecipes: patchRecipeInList(current.createdRecipes, recipeId, (recipe) => ({
                ...recipe,
                title: formValues.title.trim(),
                description: formValues.description.trim(),
                category: formValues.category,
                tags: formValues.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
                notes: formValues.notes.trim(),
                ingredients: formValues.ingredients
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean),
                steps: formValues.steps
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })),
            }
          : current,
      )

      return { previousRecipes, previousRecipe, previousCookbook, recipeId }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(['recipes'], context.previousRecipes)
      queryClient.setQueryData(['recipes', context.recipeId], context.previousRecipe)
      queryClient.setQueryData(['cookbook'], context.previousCookbook)
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipeId] })
      queryClient.invalidateQueries({ queryKey: ['cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRecipe,
    onMutate: async (recipeId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['recipes'] }),
        queryClient.cancelQueries({ queryKey: ['recipes', recipeId] }),
        queryClient.cancelQueries({ queryKey: ['cookbook'] }),
        queryClient.cancelQueries({ queryKey: ['profile'] }),
      ])

      const previousRecipes = queryClient.getQueryData(['recipes'])
      const previousRecipe = queryClient.getQueryData(['recipes', recipeId])
      const previousCookbook = queryClient.getQueryData(['cookbook'])
      const previousProfile = queryClient.getQueryData(['profile'])

      queryClient.setQueryData(['recipes'], (current) =>
        Array.isArray(current) ? current.filter((recipe) => recipe.id !== recipeId) : current,
      )
      queryClient.removeQueries({ queryKey: ['recipes', recipeId] })
      queryClient.setQueryData(['cookbook'], (current) =>
        current
          ? {
              ...current,
              createdRecipes: current.createdRecipes.filter((recipe) => recipe.id !== recipeId),
            }
          : current,
      )
      queryClient.setQueryData(['profile'], (current) =>
        current
          ? {
              ...current,
              stats: {
                ...current.stats,
                recipes: Math.max(0, current.stats.recipes - 1),
              },
            }
          : current,
      )

      return { previousRecipes, previousRecipe, previousCookbook, previousProfile, recipeId }
    },
    onError: (_error, _recipeId, context) => {
      if (!context) {
        return
      }

      queryClient.setQueryData(['recipes'], context.previousRecipes)
      queryClient.setQueryData(['recipes', context.recipeId], context.previousRecipe)
      queryClient.setQueryData(['cookbook'], context.previousCookbook)
      queryClient.setQueryData(['profile'], context.previousProfile)
    },
    onSettled: (_data, _error, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.removeQueries({ queryKey: ['recipes', recipeId] })
    },
  })
}

export function useImportExternalRecipeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importExternalRecipe,
    onSuccess: async (recipeId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recipes'] }),
        queryClient.invalidateQueries({ queryKey: ['cookbook'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations'] }),
      ])

      return recipeId
    },
  })
}
