import {
  doc as firestoreDoc,
  addDoc,
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { mockRecipes } from '@/data/mockRecipes'
import {
  firebaseAuth,
  firestoreDb,
  firebaseFunctions,
  isFirebaseConfigured,
} from '@/lib/firebase/firebase'
import { uploadRecipeImage as uploadRecipeImageToStorage } from '@/services/firebase/storageService'
import { adjustProfileCounters } from '@/services/profiles/profileCounters'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'

function wait(ms = 180) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
}

function normalizeIngredients(ingredients) {
  return normalizeList(ingredients).map((ingredient) => {
    if (typeof ingredient === 'string') {
      return ingredient
    }

    return [ingredient.quantity, ingredient.unit, ingredient.name, ingredient.note]
      .filter(Boolean)
      .join(' ')
      .trim()
  })
}

function normalizeSteps(steps) {
  return normalizeList(steps).map((step) => {
    if (typeof step === 'string') {
      return step
    }

    return step.text ?? ''
  })
}

function normalizeRecipe(docId, data) {
  return {
    id: docId,
    title: data.title ?? 'Untitled recipe',
    description: data.description ?? '',
    image: data.image?.url ?? data.imageUrl ?? FALLBACK_IMAGE,
    category: data.category ?? 'Recipe',
    tags: normalizeList(data.tags),
    sourceType: data.sourceType ?? 'internal',
    cookingTime: data.cookingTime ?? data.totalTime ?? 'Flexible',
    notes: data.notes ?? '',
    ingredients: normalizeIngredients(data.ingredients),
    steps: normalizeSteps(data.steps),
    ownerId: data.ownerId ?? null,
    visibility: data.visibility ?? 'public',
    slug: data.slug ?? docId,
    sourceId: data.sourceId ?? null,
  }
}

function getMockInternalRecipes() {
  return mockRecipes.filter((recipe) => recipe.sourceType === 'internal')
}

function filterRecipesByQuery(recipes, searchQuery) {
  if (!searchQuery?.trim()) {
    return recipes
  }

  const normalizedQuery = searchQuery.toLowerCase()

  return recipes.filter((recipe) =>
    `${recipe.title} ${recipe.description} ${recipe.tags.join(' ')} ${recipe.ingredients.join(' ')}`
      .toLowerCase()
      .includes(normalizedQuery),
  )
}

function createRecipeLoadError(error) {
  if (error?.code === 'failed-precondition') {
    return new Error(
      'Firestore index missing for the recipes query. Deploy firestore.indexes.json or create the suggested composite index in the Firebase console.',
    )
  }

  if (error?.code === 'permission-denied') {
    return new Error(
      'Firestore denied recipe reads. Ensure the recipe has visibility set to public or ownerId matches the signed-in user.',
    )
  }

  return new Error(error?.message || 'Unable to load recipes from Firestore.')
}

function normalizeExternalRecipe(recipe) {
  return {
    id: recipe.id,
    title: recipe.title ?? 'External recipe',
    description: recipe.description ?? '',
    image: recipe.image ?? FALLBACK_IMAGE,
    category: recipe.category ?? 'External',
    tags: normalizeList(recipe.tags),
    sourceType: 'api',
    cookingTime: recipe.cookingTime ?? 'Flexible',
    notes: recipe.notes ?? '',
    ingredients: normalizeList(recipe.ingredients),
    steps: normalizeList(recipe.steps),
    ownerId: null,
    visibility: 'public',
    slug: recipe.slug ?? recipe.id,
    externalId: recipe.externalId ?? String(recipe.id).replace('external:', ''),
    sourceId: recipe.sourceId ?? recipe.externalId ?? String(recipe.id).replace('external:', ''),
  }
}

function buildImportedRecipePayload(recipe, ownerId) {
  return {
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description ?? '',
    ingredients: normalizeList(recipe.ingredients),
    steps: normalizeList(recipe.steps).map((step, index) => ({
      id: `step-${index + 1}`,
      text: typeof step === 'string' ? step : step.text ?? '',
    })),
    notes: recipe.notes ?? '',
    category: recipe.category ?? 'Recipe',
    tags: normalizeList(recipe.tags),
    sourceType: 'internal',
    ownerId,
    visibility: 'public',
    sourceId: recipe.sourceId ?? recipe.externalId ?? String(recipe.id).replace('external:', ''),
    cookingTime: recipe.cookingTime ?? 'Flexible',
    image: recipe.image
      ? {
          url: recipe.image,
          storagePath: null,
          type: 'external',
        }
      : null,
  }
}

function normalizeExternalFilters(filters = {}) {
  return {
    category: filters.category ?? 'All',
    cuisine: filters.cuisine ?? 'Any',
    diet: filters.diet ?? 'Any',
    maxReadyTime: filters.maxReadyTime ?? 'Any',
    sort: filters.sort ?? 'popularity',
  }
}

async function fetchExternalRecipeSearch(searchQuery, filters = {}, offset = 0) {
  if (!firebaseFunctions) {
    return {
      recipes: [],
      totalResults: 0,
      hasMore: false,
      nextOffset: offset,
    }
  }

  const callable = httpsCallable(firebaseFunctions, 'searchRecipes')
  const normalizedFilters = normalizeExternalFilters(filters)
  const response = await callable({ query: searchQuery, filters: normalizedFilters, offset })
  const recipes = normalizeList(response.data?.results).map(normalizeExternalRecipe)
  const totalResults = response.data?.totalResults ?? recipes.length
  const nextOffset = offset + recipes.length

  return {
    recipes,
    totalResults,
    hasMore: nextOffset < totalResults,
    nextOffset,
  }
}

async function fetchExternalRecipeById(recipeId) {
  if (!firebaseFunctions) {
    return null
  }

  const callable = httpsCallable(firebaseFunctions, 'getExternalRecipe')
  const response = await callable({ recipeId })
  return response.data?.recipe ? normalizeExternalRecipe(response.data.recipe) : null
}

function getRecipeIdentity(recipe) {
  if (recipe.sourceType === 'api') {
    return recipe.sourceId ?? recipe.externalId ?? String(recipe.id).replace('external:', '')
  }

  return recipe.id
}

function mergeRecipeCollections(...collections) {
  const merged = new Map()

  collections.flat().forEach((recipe) => {
    if (!recipe) {
      return
    }

    const identity = getRecipeIdentity(recipe)

    if (!merged.has(identity) || String(recipe.id).startsWith('external:')) {
      merged.set(identity, recipe)
    }
  })

  return Array.from(merged.values())
}

async function listRecipesFromFirestore(searchQuery = '') {
  const recipesRef = collection(firestoreDb, 'recipes')
  const currentUserId = firebaseAuth?.currentUser?.uid ?? null

  const publicRecipesQuery = query(
    recipesRef,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(24),
  )

  const publicSnapshot = await getDocs(publicRecipesQuery)
  const recipes = publicSnapshot.docs.map((recipeDoc) => normalizeRecipe(recipeDoc.id, recipeDoc.data()))

  if (!currentUserId) {
    return filterRecipesByQuery(recipes, searchQuery)
  }

  const ownerRecipesQuery = query(
    recipesRef,
    where('sourceType', '==', 'internal'),
    where('ownerId', '==', currentUserId),
    orderBy('createdAt', 'desc'),
    limit(24),
  )

  const ownerSnapshot = await getDocs(ownerRecipesQuery)
  const ownerRecipes = ownerSnapshot.docs.map((recipeDoc) => normalizeRecipe(recipeDoc.id, recipeDoc.data()))
  const mergedRecipes = new Map()

  recipes.forEach((recipe) => {
    mergedRecipes.set(recipe.id, recipe)
  })

  ownerRecipes.forEach((recipe) => {
    mergedRecipes.set(recipe.id, recipe)
  })

  return filterRecipesByQuery(Array.from(mergedRecipes.values()), searchQuery)
}

async function getRecipeByIdFromFirestore(recipeId) {
  const recipeRef = firestoreDoc(firestoreDb, 'recipes', recipeId)
  const snapshot = await getDoc(recipeRef)

  if (!snapshot.exists()) {
    return null
  }

  const recipe = normalizeRecipe(snapshot.id, snapshot.data())
  const currentUserId = firebaseAuth?.currentUser?.uid ?? null
  const canRead = recipe.visibility === 'public' || (currentUserId && recipe.ownerId === currentUserId)

  return canRead ? recipe : null
}

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseLineItems(value) {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function buildRecipePayload({ formValues, ownerId }) {
  const ingredients = parseLineItems(formValues.ingredients)
  const steps = parseLineItems(formValues.steps).map((text, index) => ({
    id: `step-${index + 1}`,
    text,
  }))
  const tags = formValues.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  return {
    title: formValues.title.trim(),
    slug: toSlug(formValues.title),
    description: formValues.description.trim(),
    ingredients,
    steps,
    notes: formValues.notes.trim(),
    category: formValues.category,
    tags,
    sourceType: 'internal',
    ownerId,
    visibility: 'public',
  }
}

export function getRecipeFormDefaults(recipe) {
  if (!recipe) {
    return {
      title: '',
      category: 'Dinner',
      tags: '',
      description: '',
      ingredients: '',
      steps: '',
      notes: '',
    }
  }

  return {
    title: recipe.title ?? '',
    category: recipe.category ?? 'Dinner',
    tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
    description: recipe.description ?? '',
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
    steps: Array.isArray(recipe.steps) ? recipe.steps.join('\n') : '',
    notes: recipe.notes ?? '',
  }
}

export async function createRecipe({ formValues, imageFile }) {
  if (!firebaseAuth?.currentUser || !firestoreDb) {
    throw new Error('You must be logged in with Firebase configured to create a recipe.')
  }

  const ownerId = firebaseAuth.currentUser.uid
  const recipePayload = buildRecipePayload({ formValues, ownerId })

  const recipeRef = await addDoc(collection(firestoreDb, 'recipes'), {
    ...recipePayload,
    image: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (imageFile) {
    const uploadedImage = await uploadRecipeImage({
      ownerId,
      recipeId: recipeRef.id,
      imageFile,
    })

    if (uploadedImage) {
      await updateDoc(recipeRef, {
        image: uploadedImage,
        updatedAt: serverTimestamp(),
      })
    }
  }

  await adjustProfileCounters(ownerId, { recipeCount: 1 })

  return recipeRef.id
}

export async function importExternalRecipe(recipe) {
  if (!firebaseAuth?.currentUser || !firestoreDb) {
    throw new Error('You must be logged in with Firebase configured to save a Spoonacular recipe.')
  }

  const ownerId = firebaseAuth.currentUser.uid
  const sourceId = recipe.sourceId ?? recipe.externalId ?? String(recipe.id).replace('external:', '')
  const recipesRef = collection(firestoreDb, 'recipes')
  const duplicateQuery = query(
    recipesRef,
    where('ownerId', '==', ownerId),
    where('sourceType', '==', 'internal'),
    where('sourceId', '==', sourceId),
    limit(1),
  )
  const duplicateSnapshot = await getDocs(duplicateQuery)

  if (!duplicateSnapshot.empty) {
    return duplicateSnapshot.docs[0].id
  }

  const recipePayload = buildImportedRecipePayload(recipe, ownerId)
  const recipeRef = await addDoc(recipesRef, {
    ...recipePayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await adjustProfileCounters(ownerId, { recipeCount: 1 })

  return recipeRef.id
}

async function uploadRecipeImage({ ownerId, recipeId, imageFile }) {
  if (!imageFile) {
    return null
  }

  const uploadedImage = await uploadRecipeImageToStorage({
      ownerId,
      recipeId,
      imageFile,
    })

  return uploadedImage
}

export async function updateRecipe({ recipeId, formValues, imageFile }) {
  if (!firebaseAuth?.currentUser || !firestoreDb) {
    throw new Error('You must be logged in with Firebase configured to edit a recipe.')
  }

  const ownerId = firebaseAuth.currentUser.uid
  const recipeRef = firestoreDoc(firestoreDb, 'recipes', recipeId)
  const snapshot = await getDoc(recipeRef)

  if (!snapshot.exists()) {
    throw new Error('That recipe no longer exists.')
  }

  if (snapshot.data().ownerId !== ownerId) {
    throw new Error('Only the recipe owner can edit this recipe.')
  }

  const recipePayload = buildRecipePayload({ formValues, ownerId })
  const nextImage =
    imageFile
      ? await uploadRecipeImage({
          ownerId,
          recipeId,
          imageFile,
        })
      : snapshot.data().image ?? null

  await updateDoc(recipeRef, {
    ...recipePayload,
    image: nextImage,
    updatedAt: serverTimestamp(),
  })

  return recipeId
}

export async function deleteRecipe(recipeId) {
  if (!firebaseAuth?.currentUser || !firestoreDb) {
    throw new Error('You must be logged in with Firebase configured to delete a recipe.')
  }

  const ownerId = firebaseAuth.currentUser.uid
  const recipeRef = firestoreDoc(firestoreDb, 'recipes', recipeId)
  const snapshot = await getDoc(recipeRef)

  if (!snapshot.exists()) {
    throw new Error('That recipe no longer exists.')
  }

  if (snapshot.data().ownerId !== ownerId) {
    throw new Error('Only the recipe owner can delete this recipe.')
  }

  await deleteDoc(recipeRef)
  await adjustProfileCounters(ownerId, { recipeCount: -1 })
}

export async function listRecipes({ searchQuery = '', filters = {}, externalOffset = 0 } = {}) {
  let internalRecipes = []

  if (externalOffset === 0) {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        internalRecipes = await listRecipesFromFirestore(searchQuery)
      } catch (error) {
        throw createRecipeLoadError(error)
      }
    } else {
      await wait()
      internalRecipes = filterRecipesByQuery(getMockInternalRecipes(), searchQuery)
    }
  }

  const externalPayload = await fetchExternalRecipeSearch(searchQuery, filters, externalOffset).catch(() => ({
    recipes: [],
    totalResults: 0,
    hasMore: false,
    nextOffset: externalOffset,
  }))

  return {
    recipes: mergeRecipeCollections(internalRecipes, externalPayload.recipes),
    totalResults: externalPayload.totalResults,
    hasMore: externalPayload.hasMore,
    nextOffset: externalPayload.nextOffset,
  }
}

export async function getRecipeById(recipeId) {
  if (String(recipeId).startsWith('external:')) {
    return fetchExternalRecipeById(recipeId)
  }

  if (isFirebaseConfigured && firestoreDb) {
    try {
      return await getRecipeByIdFromFirestore(recipeId)
    } catch (error) {
      throw createRecipeLoadError(error)
    }
  }

  await wait()
  return getMockInternalRecipes().find((recipe) => recipe.id === recipeId) ?? null
}
