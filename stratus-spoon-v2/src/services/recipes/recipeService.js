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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { mockRecipes } from '@/data/mockRecipes'
import { firebaseAuth, firestoreDb, firebaseStorage, isFirebaseConfigured } from '@/lib/firebase'
import { adjustProfileCounters } from '@/services/profiles/profileCounters'

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
    image:
      data.image?.url ??
      data.imageUrl ??
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80',
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
  }
}

function getMockInternalRecipes() {
  return mockRecipes.filter((recipe) => recipe.sourceType === 'internal')
}

async function listRecipesFromFirestore() {
  const recipesRef = collection(firestoreDb, 'recipes')
  const currentUserId = firebaseAuth?.currentUser?.uid ?? null

  const publicRecipesQuery = query(
    recipesRef,
    where('sourceType', '==', 'internal'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(24),
  )

  const publicSnapshot = await getDocs(publicRecipesQuery)
  const recipes = publicSnapshot.docs.map((recipeDoc) => normalizeRecipe(recipeDoc.id, recipeDoc.data()))

  if (!currentUserId) {
    return recipes
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

  return Array.from(mergedRecipes.values())
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

async function uploadRecipeImage({ ownerId, recipeId, imageFile }) {
  if (!firebaseStorage || !imageFile) {
    return null
  }

  const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const imageRef = ref(firebaseStorage, `recipe-images/${ownerId}/${recipeId}/${Date.now()}-${safeName}`)

  await uploadBytes(imageRef, imageFile, {
    contentType: imageFile.type,
  })

  const url = await getDownloadURL(imageRef)

  return {
    storagePath: imageRef.fullPath,
    url,
    type: 'upload',
  }
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

export async function listRecipes() {
  if (isFirebaseConfigured && firestoreDb) {
    return listRecipesFromFirestore()
  }

  await wait()
  return getMockInternalRecipes()
}

export async function getRecipeById(recipeId) {
  if (isFirebaseConfigured && firestoreDb) {
    return getRecipeByIdFromFirestore(recipeId)
  }

  await wait()
  return getMockInternalRecipes().find((recipe) => recipe.id === recipeId) ?? null
}
