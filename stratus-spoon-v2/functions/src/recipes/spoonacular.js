const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes'
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'

function getApiKey() {
  const apiKey = globalThis.process?.env?.SPOONACULAR_API_KEY

  if (!apiKey) {
    throw new Error('SPOONACULAR_API_KEY is not configured for the functions runtime.')
  }

  return apiKey
}

function normalizeList(value) {
  return Array.isArray(value) ? value : []
}

function stripHtml(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeIngredient(ingredient) {
  return (
    ingredient.original ||
    [ingredient.amount, ingredient.unit, ingredient.name].filter(Boolean).join(' ').trim()
  )
}

function normalizeExternalRecipe(recipe) {
  return {
    id: `external:${recipe.id}`,
    externalId: String(recipe.id),
    title: recipe.title ?? 'External recipe',
    description: stripHtml(recipe.summary || recipe.description || ''),
    image: recipe.image || FALLBACK_IMAGE,
    category: recipe.dishTypes?.[0] || recipe.category || 'External',
    tags: normalizeList(recipe.diets).concat(normalizeList(recipe.cuisines)).slice(0, 5),
    sourceType: 'external',
    cookingTime: recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : 'Flexible',
    notes: recipe.creditsText || recipe.sourceName || 'Imported from Spoonacular',
    ingredients: normalizeList(recipe.extendedIngredients).map(normalizeIngredient),
    steps: normalizeList(recipe.analyzedInstructions?.[0]?.steps).map((step) => step.step || ''),
    ownerId: null,
    visibility: 'public',
    slug: recipe.title
      ? recipe.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : String(recipe.id),
  }
}

async function spoonacularFetch(path, params = {}) {
  const apiKey = getApiKey()
  const url = new URL(`${SPOONACULAR_BASE_URL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  url.searchParams.set('apiKey', apiKey)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Spoonacular request failed with status ${response.status}.`)
  }

  return response.json()
}

export async function searchSpoonacularRecipes(searchQuery) {
  if (!searchQuery?.trim()) {
    return []
  }

  const payload = await spoonacularFetch('/complexSearch', {
    query: searchQuery,
    addRecipeInformation: true,
    number: 12,
    fillIngredients: true,
  })

  return normalizeList(payload.results).map(normalizeExternalRecipe)
}

export async function fetchSpoonacularRecipeById(recipeId) {
  const rawId = String(recipeId).replace('external:', '')
  const payload = await spoonacularFetch(`/${rawId}/information`, {
    includeNutrition: false,
  })

  return normalizeExternalRecipe(payload)
}
