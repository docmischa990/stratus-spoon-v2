import { firebaseAuth } from '@/lib/firebase'
import { getCookbookSummary } from '@/services/cookbook/cookbookService'
import { getCurrentProfile } from '@/services/profiles/profileService'
import { listInternalRecipes } from '@/services/recipes/recipeService'

const SECTION_LIMIT = 8
const HEALTHY_TAGS = ['healthy', 'vegetarian', 'vegan', 'gluten-free', 'gluten free', 'high-protein']
const HEALTHY_CATEGORIES = ['salad', 'healthy', 'vegetarian']

function normalizeString(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags.map(normalizeString).filter(Boolean) : []
}

function normalizeCategory(category) {
  return normalizeString(category)
}

function dedupeRecipes(recipes) {
  const seen = new Set()

  return recipes.filter((recipe) => {
    if (!recipe?.id || seen.has(recipe.id)) {
      return false
    }

    seen.add(recipe.id)
    return true
  })
}

function limitRecipes(recipes, max = SECTION_LIMIT) {
  return dedupeRecipes(recipes).slice(0, max)
}

function getRecipeSignals(recipe) {
  return {
    tags: normalizeTags(recipe?.tags),
    category: normalizeCategory(recipe?.category),
  }
}

function hasTag(recipe, expectedTag) {
  const expected = normalizeString(expectedTag)
  return getRecipeSignals(recipe).tags.includes(expected)
}

function parseCookingTimeMinutes(value) {
  const match = String(value ?? '').match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : null
}

function isQuickRecipe(recipe) {
  if (hasTag(recipe, 'quick')) {
    return true
  }

  const minutes = parseCookingTimeMinutes(recipe?.cookingTime)
  return Number.isFinite(minutes) ? minutes <= 30 : false
}

function isHealthyRecipe(recipe, dietaryTags = []) {
  const signals = getRecipeSignals(recipe)
  const healthyTags = new Set([...HEALTHY_TAGS, ...normalizeTags(dietaryTags)])

  return (
    signals.tags.some((tag) => healthyTags.has(tag)) ||
    healthyTags.has(signals.category) ||
    HEALTHY_CATEGORIES.includes(signals.category)
  )
}

function buildPreferenceSets(favorites = []) {
  const tagCounts = new Map()
  const categoryCounts = new Map()

  favorites.forEach((recipe) => {
    const { tags, category } = getRecipeSignals(recipe)

    tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    })

    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    }
  })

  return { tagCounts, categoryCounts }
}

function scoreRecipe(recipe, preferences) {
  const { tags, category } = getRecipeSignals(recipe)
  const tagScore = tags.reduce((total, tag) => total + (preferences.tagCounts.get(tag) ?? 0), 0)
  const categoryScore = preferences.categoryCounts.get(category) ?? 0

  return tagScore * 2 + categoryScore
}

function sortByPreference(recipes, preferences, excludedIds = new Set()) {
  return recipes
    .filter((recipe) => !excludedIds.has(recipe.id))
    .map((recipe, index) => ({
      recipe,
      score: scoreRecipe(recipe, preferences),
      index,
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.index - right.index
    })
    .map((entry) => entry.recipe)
}

async function loadPersonalizationInputs() {
  if (!firebaseAuth?.currentUser) {
    return {
      favorites: [],
      dietaryTags: [],
    }
  }

  const [cookbook, profile] = await Promise.all([getCookbookSummary(), getCurrentProfile()])

  return {
    favorites: Array.isArray(cookbook?.favorites) ? cookbook.favorites : [],
    dietaryTags: Array.isArray(profile?.preferences?.dietaryTags) ? profile.preferences.dietaryTags : [],
  }
}

export async function getTrendingRecipes() {
  const recipes = await listInternalRecipes()
  return limitRecipes(recipes)
}

export async function getQuickRecipes() {
  const recipes = await listInternalRecipes()
  return limitRecipes(recipes.filter(isQuickRecipe))
}

export async function getHealthyRecipes() {
  const [recipes, personalization] = await Promise.all([listInternalRecipes(), loadPersonalizationInputs()])

  const prioritizedRecipes = recipes
    .map((recipe, index) => ({
      recipe,
      index,
      boosted: personalization.dietaryTags.some((tag) => hasTag(recipe, tag)),
    }))
    .filter(({ recipe }) => isHealthyRecipe(recipe, personalization.dietaryTags))
    .sort((left, right) => {
      if (left.boosted !== right.boosted) {
        return left.boosted ? -1 : 1
      }

      return left.index - right.index
    })
    .map(({ recipe }) => recipe)

  return limitRecipes(prioritizedRecipes)
}

export async function getRecommendedRecipes() {
  const [recipes, personalization] = await Promise.all([listInternalRecipes(), loadPersonalizationInputs()])

  if (!personalization.favorites.length) {
    return limitRecipes(recipes)
  }

  const excludedIds = new Set(personalization.favorites.map((recipe) => recipe.id))
  const preferences = buildPreferenceSets(personalization.favorites)
  const matches = sortByPreference(recipes, preferences, excludedIds)

  return matches.length > 0 ? limitRecipes(matches) : limitRecipes(recipes.filter((recipe) => !excludedIds.has(recipe.id)))
}

export async function getHomepageRecommendations() {
  const [recommended, trending, quickMeals, healthy] = await Promise.all([
    getRecommendedRecipes(),
    getTrendingRecipes(),
    getQuickRecipes(),
    getHealthyRecipes(),
  ])

  return {
    recommended,
    trending,
    quickMeals,
    healthy,
  }
}
