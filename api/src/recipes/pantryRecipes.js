"use strict";

const { spoonacularFetch, normalizeExternalRecipe } = require("./spoonacular");

/**
 * Calls Spoonacular /findByIngredients and returns up to 5 normalised recipes.
 * @param {string[]} ingredients - plain ingredient name strings
 * @returns {Promise<object[]>}
 */
async function findRecipesByIngredients(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return [];
  }

  // findByIngredients returns summary objects, not full recipes — we need a
  // second call per result to get steps/instructions.
  const sanitised = ingredients.map((x) => String(x).trim()).filter(Boolean)
  if (sanitised.length === 0) return []

  const summaries = await spoonacularFetch("/findByIngredients", {
    ingredients: sanitised.join(","),
    number: 5,
    ranking: 1,       // maximise used ingredients
    ignorePantry: true,
  });

  if (!Array.isArray(summaries) || summaries.length === 0) return [];

  // Fetch full recipe information for each result in parallel
  const fullRecipes = await Promise.all(
    summaries.map((s) =>
      spoonacularFetch(`/${s.id}/information`, { includeNutrition: false }).catch(() => null)
    )
  );

  return fullRecipes
    .filter(Boolean)
    .map((r) => ({
      ...normalizeExternalRecipe(r),
      // Surface ingredient match metadata from the summary
      usedIngredientCount: summaries.find((s) => String(s.id) === String(r.id))?.usedIngredientCount ?? 0,
      missedIngredientCount: summaries.find((s) => String(s.id) === String(r.id))?.missedIngredientCount ?? 0,
    }));
}

module.exports = { findRecipesByIngredients };
