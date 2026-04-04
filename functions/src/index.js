import { onCall } from 'firebase-functions/v2/https'
import { searchRecipes as searchRecipesHttp } from './searchRecipes.js'
import { fetchSpoonacularRecipeById, searchSpoonacularRecipes } from './recipes/spoonacular.js'

export const searchRecipes = onCall(async (request) => {
  const query = request.data?.query ?? ''
  const results = await searchSpoonacularRecipes(query)

  return {
    ok: true,
    query,
    results,
  }
})

export const getExternalRecipe = onCall(async (request) => {
  const recipeId = request.data?.recipeId ?? ''
  const recipe = await fetchSpoonacularRecipeById(recipeId)

  return {
    ok: true,
    recipeId,
    recipe,
  }
})

export const generateRecipeImage = onCall(async (request) => {
  return {
    ok: true,
    promptSeed: request.data?.title ?? '',
    imageUrl: null,
  }
})

export { searchRecipesHttp }