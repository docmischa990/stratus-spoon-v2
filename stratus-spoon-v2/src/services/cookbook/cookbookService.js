import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { firebaseAuth, firestoreDb, isFirebaseConfigured } from '@/lib/firebase'
import { adjustProfileCounters } from '@/services/profiles/profileCounters'
import { listRecipes } from '@/services/recipes/recipeService'

function normalizeList(value) {
  return Array.isArray(value) ? value : []
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
  }
}

function getCurrentUserId() {
  const userId = firebaseAuth?.currentUser?.uid

  if (!userId || !firestoreDb) {
    throw new Error('You must be logged in with Firebase configured to use the cookbook.')
  }

  return userId
}

async function getMyRecipes(userId) {
  const recipesRef = collection(firestoreDb, 'recipes')
  const recipesQuery = query(
    recipesRef,
    where('ownerId', '==', userId),
    where('sourceType', '==', 'internal'),
    orderBy('createdAt', 'desc'),
  )
  const snapshot = await getDocs(recipesQuery)

  return snapshot.docs.map((recipeDoc) => normalizeRecipe(recipeDoc.id, recipeDoc.data()))
}

async function getFavorites(userId) {
  const favoritesRef = collection(firestoreDb, 'users', userId, 'favorites')
  const favoritesQuery = query(favoritesRef, orderBy('savedAt', 'desc'))
  const favoritesSnapshot = await getDocs(favoritesQuery)

  const favoriteDocs = await Promise.all(
    favoritesSnapshot.docs.map(async (favoriteDoc) => {
      const favoriteData = favoriteDoc.data()
      const recipeRef = doc(firestoreDb, 'recipes', favoriteDoc.id)
      const recipeSnapshot = await getDoc(recipeRef)

      if (!recipeSnapshot.exists()) {
        return favoriteData.recipeSnapshot
          ? normalizeRecipe(favoriteDoc.id, {
              title: favoriteData.recipeSnapshot.title,
              description: '',
              imageUrl: favoriteData.recipeSnapshot.imageUrl,
              category: favoriteData.recipeSnapshot.category || 'Saved',
              tags: [],
              sourceType: 'internal',
              totalTime: 'Saved',
              notes: '',
              ingredients: [],
              steps: [],
            })
          : null
      }

      return normalizeRecipe(recipeSnapshot.id, recipeSnapshot.data())
    }),
  )

  return favoriteDocs.filter(Boolean)
}

async function getCollections(userId) {
  const collectionsRef = collection(firestoreDb, 'users', userId, 'collections')
  const collectionsQuery = query(collectionsRef, orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(collectionsQuery)

  const collectionsWithRecipes = await Promise.all(
    snapshot.docs.map(async (collectionDoc) => {
      const recipesRef = collection(
        firestoreDb,
        'users',
        userId,
        'collections',
        collectionDoc.id,
        'recipes',
      )
      const recipesSnapshot = await getDocs(query(recipesRef, orderBy('addedAt', 'desc')))

      return {
        id: collectionDoc.id,
        ...collectionDoc.data(),
        recipes: recipesSnapshot.docs.map((recipeDoc) => ({
          id: recipeDoc.id,
          ...recipeDoc.data(),
        })),
      }
    }),
  )

  return collectionsWithRecipes
}

export async function getCookbookSummary() {
  if (!isFirebaseConfigured || !firestoreDb || !firebaseAuth?.currentUser) {
    const recipes = await listRecipes()

    return {
      favorites: [],
      createdRecipes: recipes.filter((recipe) => recipe.sourceType === 'internal'),
      collections: [],
      isFallback: true,
    }
  }

  const userId = getCurrentUserId()
  const [favorites, createdRecipes, collections] = await Promise.all([
    getFavorites(userId),
    getMyRecipes(userId),
    getCollections(userId),
  ])

  return {
    favorites,
    createdRecipes,
    collections,
    isFallback: false,
  }
}

export async function isRecipeFavorited(recipeId) {
  if (!isFirebaseConfigured || !firestoreDb || !firebaseAuth?.currentUser) {
    return false
  }

  const userId = getCurrentUserId()
  const favoriteRef = doc(firestoreDb, 'users', userId, 'favorites', recipeId)
  const snapshot = await getDoc(favoriteRef)

  return snapshot.exists()
}

export async function saveFavorite(recipe) {
  const userId = getCurrentUserId()
  const favoriteRef = doc(firestoreDb, 'users', userId, 'favorites', recipe.id)
  const existing = await getDoc(favoriteRef)

  await setDoc(favoriteRef, {
    recipeId: recipe.id,
    recipeOwnerId: recipe.ownerId ?? null,
    savedAt: serverTimestamp(),
    recipeSnapshot: {
      title: recipe.title,
      imageUrl: recipe.image ?? null,
      category: recipe.category ?? null,
    },
  })

  if (!existing.exists()) {
    await adjustProfileCounters(userId, { favoriteRecipeCount: 1 })
  }
}

export async function removeFavorite(recipeId) {
  const userId = getCurrentUserId()
  const favoriteRef = doc(firestoreDb, 'users', userId, 'favorites', recipeId)
  const existing = await getDoc(favoriteRef)

  await deleteDoc(favoriteRef)

  if (existing.exists()) {
    await adjustProfileCounters(userId, { favoriteRecipeCount: -1 })
  }
}

export async function createCollection({ name, description }) {
  const userId = getCurrentUserId()
  const collectionsRef = collection(firestoreDb, 'users', userId, 'collections')

  await addDoc(collectionsRef, {
    name: name.trim(),
    description: description.trim(),
    coverImageUrl: null,
    recipeCount: 0,
    visibility: 'private',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await adjustProfileCounters(userId, { collectionCount: 1 })
}

export async function deleteCollection(collectionId) {
  const userId = getCurrentUserId()
  const collectionRef = doc(firestoreDb, 'users', userId, 'collections', collectionId)
  const collectionRecipeEntriesRef = collection(
    firestoreDb,
    'users',
    userId,
    'collections',
    collectionId,
    'recipes',
  )
  const recipeEntriesSnapshot = await getDocs(collectionRecipeEntriesRef)

  await Promise.all(
    recipeEntriesSnapshot.docs.map((entryDoc) =>
      deleteDoc(
        doc(
          firestoreDb,
          'users',
          userId,
          'collections',
          collectionId,
          'recipes',
          entryDoc.id,
        ),
      ),
    ),
  )

  await deleteDoc(collectionRef)
  await adjustProfileCounters(userId, { collectionCount: -1 })
}

export async function addRecipeToCollection({ collectionId, recipe }) {
  const userId = getCurrentUserId()
  const collectionRef = doc(firestoreDb, 'users', userId, 'collections', collectionId)
  const collectionRecipeRef = doc(
    firestoreDb,
    'users',
    userId,
    'collections',
    collectionId,
    'recipes',
    recipe.id,
  )
  const existingMembership = await getDoc(collectionRecipeRef)

  if (!existingMembership.exists()) {
    await setDoc(collectionRecipeRef, {
      recipeId: recipe.id,
      addedAt: serverTimestamp(),
      note: null,
      recipeSnapshot: {
        title: recipe.title,
        imageUrl: recipe.image ?? null,
        category: recipe.category ?? null,
      },
    })

    await updateDoc(collectionRef, {
      recipeCount: increment(1),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function removeRecipeFromCollection({ collectionId, recipeId }) {
  const userId = getCurrentUserId()
  const collectionRef = doc(firestoreDb, 'users', userId, 'collections', collectionId)
  const collectionRecipeRef = doc(
    firestoreDb,
    'users',
    userId,
    'collections',
    collectionId,
    'recipes',
    recipeId,
  )
  const existingMembership = await getDoc(collectionRecipeRef)

  if (existingMembership.exists()) {
    await deleteDoc(collectionRecipeRef)
    await updateDoc(collectionRef, {
      recipeCount: increment(-1),
      updatedAt: serverTimestamp(),
    })
  }
}
