const {HttpsError, onCall} = require("firebase-functions/v2/https");
const {importRecipes} = require("./src/recipes/importRecipes");
const {
  fetchSpoonacularRecipeById,
  searchSpoonacularRecipes,
} = require("./src/recipes/spoonacular");
const {generateAndStoreRecipeImage} = require("./src/images/generateRecipeImage");

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

const { findRecipesByIngredients } = require("./src/recipes/pantryRecipes");

exports.generatePantryRecipes = onCall(
  { secrets: ["SPOONACULAR_API_KEY"] },
  async (request) => {
    const ingredients = request.data?.ingredients;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new HttpsError("invalid-argument", "ingredients must be a non-empty array.");
    }
    const recipes = await findRecipesByIngredients(ingredients.slice(0, 30));
    return { ok: true, recipes };
  }
);

exports.generateRecipeImage = onCall(async (request) => {
  const title = request.data?.title ?? "";
  const description = request.data?.description ?? "";
  const recipeId = request.data?.recipeId ?? "draft";
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError("unauthenticated", "You must be signed in to generate recipe images.");
  }

  const payload = await generateAndStoreRecipeImage({
    userId,
    recipeId,
    title,
    description,
  });

  return {
    ok: true,
    image: payload.image,
    prompt: payload.prompt,
    remaining: payload.remaining,
  };
});
