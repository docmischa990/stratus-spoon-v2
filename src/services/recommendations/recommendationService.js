import { firebaseAuth } from '@/lib/firebase'
import { getCookbookSummary } from '@/services/cookbook/cookbookService'
import { getCurrentProfile } from '@/services/profiles/profileService'
import { listInternalRecipes } from '@/services/recipes/recipeService'
import { getBehaviourSignals } from '@/services/behaviour/behaviourService'
import { getMultipleRecipeStats } from '@/services/recipes/recipeStatsService'
import { extractIngredientKeywords } from '@/utils/ingredientParser'

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

/**
 * Build a frequency map: { keyword: count } from an array of strings.
 */
function buildFrequencyMap(items) {
  const map = {}
  for (const item of items) {
    if (!item) continue
    const key = item.toLowerCase().trim()
    map[key] = (map[key] ?? 0) + 1
  }
  return map
}

/**
 * Build a weighted preference profile from all user signals.
 * Liked recipes are worth 2× the weight of viewed ones.
 */
function buildWeightedProfile({ behaviour, favoriteRecipes, likedRecipes, dislikedRecipes }) {
  const ingredientItems = [
    ...behaviour.viewedIngredients,
    ...favoriteRecipes.flatMap((r) => extractIngredientKeywords(r.ingredients ?? [])),
    // Liked recipes at 2× weight
    ...likedRecipes.flatMap((r) => extractIngredientKeywords(r.ingredients ?? [])),
    ...likedRecipes.flatMap((r) => extractIngredientKeywords(r.ingredients ?? [])),
  ]

  const tagItems = [
    ...behaviour.viewedTags,
    ...favoriteRecipes.flatMap((r) => r.tags ?? []),
    ...likedRecipes.flatMap((r) => r.tags ?? []),
    ...likedRecipes.flatMap((r) => r.tags ?? []),
  ]

  const categoryItems = [
    ...behaviour.viewedCategories,
    ...favoriteRecipes.map((r) => r.category).filter(Boolean),
    ...likedRecipes.map((r) => r.category).filter(Boolean),
  ]

  const searchKeywords = behaviour.searchTerms.flatMap((term) =>
    term.split(/\s+/).filter((w) => w.length >= 3)
  )

  const dislikedIngredients = new Set(
    dislikedRecipes.flatMap((r) => extractIngredientKeywords(r.ingredients ?? []))
  )
  const dislikedTags = new Set(
    dislikedRecipes.flatMap((r) => (r.tags ?? []).map((t) => t.toLowerCase().trim()))
  )

  return {
    ingredientFrequency: buildFrequencyMap(ingredientItems),
    tagFrequency: buildFrequencyMap(tagItems),
    categoryFrequency: buildFrequencyMap(categoryItems),
    searchKeywords,
    dislikedIngredients,
    dislikedTags,
    dislikedRecipeIds: new Set(behaviour.dislikedRecipeIds ?? []),
  }
}

/**
 * Score a single recipe candidate against the preference profile.
 */
function scoreRecipeCandidate(recipe, profile, stats) {
  const recipeIngredients = new Set(extractIngredientKeywords(recipe.ingredients ?? []))
  const recipeTags = new Set((recipe.tags ?? []).map((t) => t.toLowerCase().trim()))
  const recipeCategory = (recipe.category ?? '').toLowerCase().trim()

  let ingredientScore = 0
  for (const [kw, count] of Object.entries(profile.ingredientFrequency)) {
    if (recipeIngredients.has(kw)) ingredientScore += count * 3
  }

  let tagScore = 0
  for (const [tag, count] of Object.entries(profile.tagFrequency)) {
    if (recipeTags.has(tag)) tagScore += count * 2
  }

  const categoryScore = (profile.categoryFrequency[recipeCategory] ?? 0) * 1.5

  let searchScore = 0
  for (const kw of profile.searchKeywords) {
    if (recipeIngredients.has(kw) || recipeTags.has(kw)) searchScore += 2
  }

  let dislikePenalty = 0
  for (const kw of profile.dislikedIngredients) {
    if (recipeIngredients.has(kw)) dislikePenalty += 3
  }
  for (const tag of profile.dislikedTags) {
    if (recipeTags.has(tag)) dislikePenalty += 4
  }

  const likes = stats?.likeCount ?? 0
  const dislikes = stats?.dislikeCount ?? 0
  const popularityBonus = likes + dislikes > 0 ? likes / (likes + dislikes) : 0

  return ingredientScore + tagScore + categoryScore + searchScore - dislikePenalty + popularityBonus
}

export async function getTrendingRecipes() {
  const allRecipes = await listInternalRecipes().catch(() => [])
  const statsMap = await getMultipleRecipeStats(allRecipes.map((r) => r.id)).catch(() => ({}))

  const scored = allRecipes.map((recipe) => {
    const stats = statsMap[recipe.id] ?? {}
    const trendingScore =
      (stats.viewCount ?? 0) +
      (stats.likeCount ?? 0) * 2 +
      (stats.favoriteCount ?? 0) * 1.5
    return { recipe, trendingScore }
  })

  scored.sort((a, b) => b.trendingScore - a.trendingScore)

  return limitRecipes(dedupeRecipes(scored.map((s) => s.recipe)))
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
  const [cookbookData, behaviour, allRecipes] = await Promise.all([
    getCookbookSummary().catch(() => ({ favorites: [], createdRecipes: [] })),
    getBehaviourSignals().catch(() => ({
      viewedRecipeIds: [], viewedIngredients: [], viewedTags: [], viewedCategories: [],
      searchTerms: [], importedRecipeIds: [], likedRecipeIds: [], dislikedRecipeIds: [],
    })),
    listInternalRecipes().catch(() => []),
  ])

  const favoriteRecipes = cookbookData?.favorites ?? []
  const likedIds = behaviour.likedRecipeIds ?? []
  const dislikedIds = behaviour.dislikedRecipeIds ?? []

  const likedRecipes = allRecipes.filter((r) => likedIds.includes(r.id))
  const dislikedRecipes = allRecipes.filter((r) => dislikedIds.includes(r.id))

  const statsMap = await getMultipleRecipeStats(allRecipes.map((r) => r.id)).catch(() => ({}))

  const profile = buildWeightedProfile({ behaviour, favoriteRecipes, likedRecipes, dislikedRecipes })

  const candidates = allRecipes.filter((r) => !profile.dislikedRecipeIds.has(r.id))

  const scored = candidates.map((recipe) => ({
    recipe,
    score: scoreRecipeCandidate(recipe, profile, statsMap[recipe.id]),
  }))

  scored.sort((a, b) => b.score - a.score)

  const top = scored.filter((s) => s.score > 0).slice(0, SECTION_LIMIT)

  if (top.length === 0) {
    return limitRecipes(dedupeRecipes(allRecipes))
  }

  return top.map((s) => s.recipe)
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
