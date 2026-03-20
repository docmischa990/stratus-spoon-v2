"use strict";

const {onRequest, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

initializeApp();

const firestore = getFirestore();
const SPOONACULAR_URL = "https://api.spoonacular.com/recipes/random?number=20";

function stripHtml(value) {
  return String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
}

function toSlug(value, fallback) {
  const slug = String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function normalizeTags(recipe) {
  const candidateTags = [
    ...(Array.isArray(recipe.dishTypes) ? recipe.dishTypes : []),
    ...(Array.isArray(recipe.diets) ? recipe.diets : []),
    ...(Array.isArray(recipe.cuisines) ? recipe.cuisines : []),
    ...(Array.isArray(recipe.occasions) ? recipe.occasions : []),
  ];

  return Array.from(new Set(candidateTags.filter(Boolean))).slice(0, 12);
}

function normalizeIngredients(recipe) {
  if (!Array.isArray(recipe.extendedIngredients)) {
    return [];
  }

  return recipe.extendedIngredients.map((ingredient) => ingredient.original || "").filter(Boolean);
}

function normalizeSteps(recipe) {
  const instructions = Array.isArray(recipe.analyzedInstructions) ?
    recipe.analyzedInstructions :
    [];
  const primaryInstruction = instructions[0];

  if (!primaryInstruction || !Array.isArray(primaryInstruction.steps)) {
    return [];
  }

  return primaryInstruction.steps
      .map((step) => ({
        id: `step-${step.number || 0}`,
        text: String(step.step || "").trim(),
      }))
      .filter((step) => step.text);
}

function buildSearchTokens(recipe) {
  const searchPool = [
    recipe.title,
    recipe.summary,
    ...(Array.isArray(recipe.dishTypes) ? recipe.dishTypes : []),
    ...(Array.isArray(recipe.diets) ? recipe.diets : []),
    ...(Array.isArray(recipe.cuisines) ? recipe.cuisines : []),
  ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .split(/\s+/)
      .filter(Boolean);

  return Array.from(new Set(searchPool)).slice(0, 40);
}

function mapRecipe(recipe) {
  const spoonacularId = String(recipe.id);
  const title = recipe.title || `Spoonacular recipe ${spoonacularId}`;
  const imageUrl = recipe.image || null;

  return {
    title,
    slug: toSlug(title, spoonacularId),
    description: stripHtml(recipe.summary),
    imageUrl,
    image: imageUrl ? {
      url: imageUrl,
      storagePath: null,
      type: "external",
    } : null,
    category: recipe.dishTypes && recipe.dishTypes[0] ? recipe.dishTypes[0] : "general",
    tags: normalizeTags(recipe),
    ingredients: normalizeIngredients(recipe),
    steps: normalizeSteps(recipe),
    notes: "",
    sourceId: spoonacularId,
    sourceType: "api",
    visibility: "public",
    ownerId: "spoonacular",
    cookingTime: recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Flexible",
    searchTokens: buildSearchTokens(recipe),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function fetchSpoonacularRecipes() {
  const apiKey = process.env.SPOONACULAR_API_KEY || null;

  if (!apiKey) {
    throw new HttpsError(
        "failed-precondition",
        "SPOONACULAR_API_KEY is not configured in the functions environment.",
    );
  }

  const response = await fetch(`${SPOONACULAR_URL}&apiKey=${encodeURIComponent(apiKey)}`);

  if (!response.ok) {
    const responseText = await response.text();

    throw new HttpsError(
        "unavailable",
        `Spoonacular request failed with status ${response.status}: ${responseText}`,
    );
  }

  const payload = await response.json();
  return Array.isArray(payload.recipes) ? payload.recipes : [];
}

async function importRecipeBatch(recipes) {
  const recipeIds = recipes.map((recipe) => String(recipe.id));
  const recipeRefs = recipeIds.map((recipeId) => firestore.collection("recipes").doc(recipeId));
  const snapshots = recipeRefs.length ? await firestore.getAll(...recipeRefs) : [];
  const existingIds = new Set(snapshots.filter((snapshot) => snapshot.exists).map((snapshot) => snapshot.id));
  const batch = firestore.batch();
  let importedCount = 0;

  recipes.forEach((recipe) => {
    const recipeId = String(recipe.id);

    if (existingIds.has(recipeId)) {
      return;
    }

    batch.set(firestore.collection("recipes").doc(recipeId), mapRecipe(recipe));
    importedCount += 1;
  });

  if (importedCount > 0) {
    await batch.commit();
  }

  return importedCount;
}

const importRecipes = onRequest({cors: true, secrets: ["SPOONACULAR_API_KEY"]}, async (request, response) => {
  if (request.method !== "POST" && request.method !== "GET") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const recipes = await fetchSpoonacularRecipes();
    const importedCount = await importRecipeBatch(recipes);

    logger.info("Imported Spoonacular recipes", {
      requestedCount: recipes.length,
      importedCount,
    });

    response.status(200).json({
      success: true,
      importedCount,
      requestedCount: recipes.length,
    });
  } catch (error) {
    logger.error("Failed to import Spoonacular recipes", error);

    const status = error instanceof HttpsError ? 503 : 500;
    response.status(status).json({
      success: false,
      error: error.message || "Unable to import recipes.",
    });
  }
});

module.exports = {
  importRecipes,
};
