import { firebaseAuth } from '@/lib/firebase/firebase'

const FUNCTIONS_REGION = 'us-central1'

function getPantryFunctionUrl(functionName) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
  if (!projectId) throw new Error('Firebase project ID is not configured.')
  return `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net/${functionName}`
}

async function callPantryFunction(functionName, payload) {
  const headers = { 'Content-Type': 'application/json' }
  const idToken = await firebaseAuth?.currentUser?.getIdToken?.().catch(() => null)
  if (idToken) headers.Authorization = `Bearer ${idToken}`

  const response = await fetch(getPantryFunctionUrl(functionName), {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: payload }),
  })

  const responsePayload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      responsePayload?.error?.message ||
      responsePayload?.message ||
      `${functionName} failed with status ${response.status}`
    throw new Error(message)
  }

  return responsePayload?.result ?? responsePayload?.data ?? responsePayload ?? {}
}

/**
 * Send pantry ingredient names to the backend and receive up to 5 recipe suggestions.
 * @param {string[]} ingredientNames - plain name strings (not quantities)
 * @returns {Promise<object[]>}
 */
export async function generateRecipesFromPantry(ingredientNames) {
  const payload = await callPantryFunction('generatePantryRecipes', {
    ingredients: ingredientNames,
  })
  return Array.isArray(payload.recipes) ? payload.recipes : []
}

/**
 * Subtract recipe ingredients from pantry items.
 * Matches by keyword overlap (case-insensitive substring).
 *
 * @param {object[]} pantryItems - from getPantry()
 * @param {string[]} recipeIngredients - raw ingredient strings from recipe
 * @returns {{ toUpdate: {id, quantity}[], toDelete: string[] }}
 */
export function computeDeductions(pantryItems, recipeIngredients) {
  const toUpdate = []
  const toDelete = []
  const touched = new Set()

  for (const recipeIngredient of recipeIngredients) {
    const lower = recipeIngredient.toLowerCase()
    for (const item of pantryItems) {
      if (touched.has(item.id)) continue
      if (lower.includes(item.name.toLowerCase()) || item.name.toLowerCase().split(' ').some((w) => lower.includes(w))) {
        touched.add(item.id)
        const currentQty = parseFloat(item.quantity) || 1
        const newQty = currentQty - 1
        if (newQty <= 0) {
          toDelete.push(item.id)
        } else {
          toUpdate.push({ id: item.id, quantity: String(newQty) })
        }
      }
    }
  }

  return { toUpdate, toDelete }
}
