"use strict";

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80";

function getApiKey() {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    throw new Error("SPOONACULAR_API_KEY is not configured in the functions runtime.");
  }

  return apiKey;
}

function createSpoonacularError(status, responseText) {
  const error = new Error(`Spoonacular request failed with status ${status}: ${responseText}`);
  error.status = status;
  error.responseText = responseText;
  return error;
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeIngredient(ingredient) {
  return (
    ingredient.original ||
    [ingredient.amount, ingredient.unit, ingredient.name].filter(Boolean).join(" ").trim()
  );
}

function toSlug(value, fallback) {
  const slug = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function normalizeExternalRecipe(recipe) {
  return {
    id: `external:${recipe.id}`,
    externalId: String(recipe.id),
    sourceId: String(recipe.id),
    title: recipe.title || "External recipe",
    description: stripHtml(recipe.summary || recipe.description || ""),
    image: recipe.image || FALLBACK_IMAGE,
    category: recipe.dishTypes?.[0] || recipe.category || "Recipe",
    tags: Array.from(
        new Set([
          ...normalizeList(recipe.dishTypes),
          ...normalizeList(recipe.diets),
          ...normalizeList(recipe.cuisines),
        ].filter(Boolean)),
    ).slice(0, 8),
    sourceType: "api",
    cookingTime: recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Flexible",
    notes: recipe.creditsText || recipe.sourceName || "Imported from Spoonacular",
    ingredients: normalizeList(recipe.extendedIngredients).map(normalizeIngredient),
    steps: normalizeList(recipe.analyzedInstructions?.[0]?.steps).map((step) => step.step || ""),
    ownerId: "spoonacular",
    visibility: "public",
    slug: toSlug(recipe.title, String(recipe.id)),
  };
}

async function spoonacularFetch(path, params = {}) {
  const apiKey = getApiKey();
  const url = new URL(`${SPOONACULAR_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    const responseText = await response.text();
    throw createSpoonacularError(response.status, responseText);
  }

  return response.json();
}

function buildComplexSearchParams(searchQuery, filters = {}, offset = 0) {
  const params = {
    sort: filters.sort || "popularity",
    sortDirection: "desc",
    addRecipeInformation: true,
    fillIngredients: true,
    number: 12,
    offset,
  };

  if (searchQuery && searchQuery.trim()) {
    params.query = searchQuery.trim();
  }

  if (filters.category && filters.category !== "All") {
    params.type = filters.category;
  }

  if (filters.cuisine && filters.cuisine !== "Any") {
    params.cuisine = filters.cuisine;
  }

  if (filters.diet && filters.diet !== "Any") {
    params.diet = filters.diet;
  }

  if (filters.maxReadyTime && filters.maxReadyTime !== "Any") {
    params.maxReadyTime = filters.maxReadyTime;
  }

  return params;
}

async function fetchDiscoveryRecipes(filters, offset) {
  const payload = await spoonacularFetch("/complexSearch", {
    ...buildComplexSearchParams("", filters, offset),
  });

  return {
    results: normalizeList(payload.results).map(normalizeExternalRecipe),
    totalResults: payload.totalResults || 0,
    offset,
  };
}

async function fetchSearchRecipes(searchQuery, filters, offset) {
  const payload = await spoonacularFetch("/complexSearch", {
    ...buildComplexSearchParams(searchQuery, filters, offset),
  });

  return {
    results: normalizeList(payload.results).map(normalizeExternalRecipe),
    totalResults: payload.totalResults || 0,
    offset,
  };
}

async function searchSpoonacularRecipes(searchQuery, filters = {}, offset = 0) {
  if (!searchQuery || !searchQuery.trim()) {
    return fetchDiscoveryRecipes(filters, offset);
  }

  return fetchSearchRecipes(searchQuery.trim(), filters, offset);
}

async function fetchSpoonacularRecipeById(recipeId) {
  const rawId = String(recipeId).replace("external:", "");
  const payload = await spoonacularFetch(`/${rawId}/information`, {
    includeNutrition: false,
  });

  return normalizeExternalRecipe(payload);
}

module.exports = {
  fetchSpoonacularRecipeById,
  searchSpoonacularRecipes,
  spoonacularFetch,
  normalizeExternalRecipe,
};
