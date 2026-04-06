import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/useAuth'
import {
  generateRecipesFromPantry,
  computeDeductions,
} from '@/services/pantry/pantryRecipeService'
import { updateIngredient, deleteIngredient } from '@/services/pantry/pantryService'

export function useGeneratePantryRecipes() {
  return useMutation({
    mutationFn: (ingredientNames) => generateRecipesFromPantry(ingredientNames),
  })
}

export function useApplyRecipeToPantry() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pantryItems, recipeIngredients }) => {
      const { toUpdate, toDelete } = computeDeductions(pantryItems, recipeIngredients)
      await Promise.all([
        ...toUpdate.map(({ id, quantity }) => updateIngredient(user.uid, id, { quantity })),
        ...toDelete.map((id) => deleteIngredient(user.uid, id)),
      ])
      return { updatedCount: toUpdate.length, deletedCount: toDelete.length }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry', user.uid] }),
  })
}
