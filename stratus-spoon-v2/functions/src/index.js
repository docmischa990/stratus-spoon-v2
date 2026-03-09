export async function searchRecipes(request) {
  return {
    ok: true,
    query: request?.query ?? '',
    results: [],
  }
}

export async function getExternalRecipe(recipeId) {
  return {
    ok: true,
    recipeId,
    recipe: null,
  }
}

export async function generateRecipeImage(payload) {
  return {
    ok: true,
    promptSeed: payload?.title ?? '',
    imageUrl: null,
  }
}
