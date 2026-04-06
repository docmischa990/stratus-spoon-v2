import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreDb, firebaseAuth } from '@/lib/firebase'
import { extractIngredientKeywords } from '@/utils/ingredientParser'
import { incrementStat } from '@/services/recipes/recipeStatsService'

const VIEW_CAP = 50
const SEARCH_CAP = 20

function getCurrentUserId() {
  return firebaseAuth?.currentUser?.uid ?? null
}

function capArray(arr, cap) {
  if (!Array.isArray(arr)) return []
  return arr.length > cap ? arr.slice(arr.length - cap) : arr
}

const BEHAVIOUR_DEFAULTS = {
  viewedRecipeIds: [],
  viewedIngredients: [],
  viewedTags: [],
  viewedCategories: [],
  searchTerms: [],
  importedRecipeIds: [],
  likedRecipeIds: [],
  dislikedRecipeIds: [],
}

export async function getBehaviourSignals() {
  const userId = getCurrentUserId()
  if (!userId || !firestoreDb) return { ...BEHAVIOUR_DEFAULTS }

  const ref = doc(firestoreDb, 'users', userId, 'behaviour', 'signals')
  const snap = await getDoc(ref)

  if (!snap.exists()) return { ...BEHAVIOUR_DEFAULTS }

  return { ...BEHAVIOUR_DEFAULTS, ...snap.data() }
}

export async function recordRecipeView({ recipeId, recipe }) {
  const userId = getCurrentUserId()
  if (!userId || !firestoreDb || !recipeId) return

  const ref = doc(firestoreDb, 'users', userId, 'behaviour', 'signals')

  const ingredientKeywords = extractIngredientKeywords(recipe?.ingredients ?? [])
  const tags = Array.isArray(recipe?.tags) ? recipe.tags.map((t) => t.toLowerCase().trim()) : []
  const category = recipe?.category ? recipe.category.toLowerCase().trim() : null

  const snap = await getDoc(ref)
  const current = snap.exists() ? snap.data() : BEHAVIOUR_DEFAULTS
  const viewedRecipeIds = capArray(
    [...(current.viewedRecipeIds ?? []).filter((id) => id !== recipeId), recipeId],
    VIEW_CAP
  )

  const update = {
    viewedRecipeIds,
    updatedAt: serverTimestamp(),
  }
  if (ingredientKeywords.length > 0) update.viewedIngredients = arrayUnion(...ingredientKeywords)
  if (tags.length > 0) update.viewedTags = arrayUnion(...tags)
  if (category) update.viewedCategories = arrayUnion(category)

  await setDoc(ref, update, { merge: true })

  await incrementStat({ recipeId, field: 'viewCount' })
}

export async function recordSearch({ searchTerm }) {
  const userId = getCurrentUserId()
  if (!userId || !firestoreDb || !searchTerm?.trim()) return

  const term = searchTerm.trim().toLowerCase()
  const ref = doc(firestoreDb, 'users', userId, 'behaviour', 'signals')

  const snap = await getDoc(ref)
  const current = snap.exists() ? snap.data() : BEHAVIOUR_DEFAULTS
  const searchTerms = capArray(
    [...(current.searchTerms ?? []).filter((t) => t !== term), term],
    SEARCH_CAP
  )

  await setDoc(ref, { searchTerms, updatedAt: serverTimestamp() }, { merge: true })
}

export async function recordImport({ recipeId, recipe }) {
  const userId = getCurrentUserId()
  if (!userId || !firestoreDb || !recipeId) return

  const ref = doc(firestoreDb, 'users', userId, 'behaviour', 'signals')

  const ingredientKeywords = extractIngredientKeywords(recipe?.ingredients ?? [])
  const tags = Array.isArray(recipe?.tags) ? recipe.tags.map((t) => t.toLowerCase().trim()) : []
  const category = recipe?.category ? recipe.category.toLowerCase().trim() : null

  const update = {
    importedRecipeIds: arrayUnion(recipeId),
    updatedAt: serverTimestamp(),
  }
  if (ingredientKeywords.length > 0) update.viewedIngredients = arrayUnion(...ingredientKeywords)
  if (tags.length > 0) update.viewedTags = arrayUnion(...tags)
  if (category) update.viewedCategories = arrayUnion(category)

  await setDoc(ref, update, { merge: true })

  await incrementStat({ recipeId, field: 'importCount' })
}
