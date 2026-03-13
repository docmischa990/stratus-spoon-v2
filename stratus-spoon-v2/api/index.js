const {onCall} = require("firebase-functions/v2/https");
const {importRecipes} = require("./src/recipes/importRecipes");
const {
  fetchSpoonacularRecipeById,
  searchSpoonacularRecipes,
} = require("./src/recipes/spoonacular");

exports.importRecipes = importRecipes;
exports.searchRecipes = onCall({secrets: ["SPOONACULAR_API_KEY"]}, async (request) => {
  const query = request.data?.query ?? "";
  const filters = request.data?.filters ?? {};
  const offset = Number(request.data?.offset ?? 0) || 0;

  try {
    const payload = await searchSpoonacularRecipes(query, filters, offset);

    return {
      ok: true,
      query,
      filters,
      offset,
      results: payload.results,
      totalResults: payload.totalResults,
      quotaExceeded: false,
    };
  } catch (error) {
    if (error?.status === 402) {
      console.warn("Spoonacular daily limit reached.", error.responseText || error.message);

      return {
        ok: true,
        query,
        filters,
        offset,
        results: [],
        totalResults: 0,
        quotaExceeded: true,
      };
    }

    throw error;
  }
});

exports.getExternalRecipe = onCall({secrets: ["SPOONACULAR_API_KEY"]}, async (request) => {
  const recipeId = request.data?.recipeId ?? "";
  const recipe = await fetchSpoonacularRecipeById(recipeId);

  return {
    ok: true,
    recipeId,
    recipe,
  };
});
