import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase/firebase'

function assertFirestoreConfigured() {
  if (!firestoreDb) {
    throw new Error('Firestore is not configured.')
  }
}

export async function createUserProfile(user, profileOverrides = {}) {
  assertFirestoreConfigured()

  const userRef = doc(firestoreDb, 'users', user.uid)
  const userSnapshot = await getDoc(userRef)

  const profileData = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: profileOverrides.displayName ?? user.displayName ?? '',
    photoURL: profileOverrides.photoURL ?? user.photoURL ?? null,
    bio: profileOverrides.bio ?? '',
    recipeCount: profileOverrides.recipeCount ?? 0,
    favoriteRecipeCount: profileOverrides.favoriteRecipeCount ?? 0,
    collectionCount: profileOverrides.collectionCount ?? 0,
    preferences: profileOverrides.preferences ?? {
      dietaryTags: [],
      theme: null,
    },
    updatedAt: serverTimestamp(),
  }

  await setDoc(
    userRef,
    {
      ...profileData,
      createdAt: userSnapshot.exists() ? userSnapshot.data().createdAt ?? serverTimestamp() : serverTimestamp(),
    },
    { merge: true },
  )

  const nextSnapshot = await getDoc(userRef)
  return nextSnapshot.data()
}

export async function getUserProfile(userId) {
  assertFirestoreConfigured()

  const userRef = doc(firestoreDb, 'users', userId)
  const snapshot = await getDoc(userRef)

  return snapshot.exists() ? snapshot.data() : null
}

export async function saveRecipe(recipeId, recipeData) {
  assertFirestoreConfigured()

  const recipeRef = recipeId
    ? doc(firestoreDb, 'recipes', recipeId)
    : doc(collection(firestoreDb, 'recipes'))

  await setDoc(
    recipeRef,
    {
      ...recipeData,
      updatedAt: serverTimestamp(),
      createdAt: recipeData.createdAt ?? serverTimestamp(),
    },
    { merge: true },
  )

  return recipeRef.id
}

export async function fetchRecipes({ ownerId, sourceType = 'internal', visibility = 'public' } = {}) {
  assertFirestoreConfigured()

  const recipesRef = collection(firestoreDb, 'recipes')
  const constraints = [orderBy('createdAt', 'desc'), limit(24)]

  if (sourceType) {
    constraints.unshift(where('sourceType', '==', sourceType))
  }

  if (ownerId) {
    constraints.unshift(where('ownerId', '==', ownerId))
  } else if (visibility) {
    constraints.unshift(where('visibility', '==', visibility))
  }

  const snapshot = await getDocs(query(recipesRef, ...constraints))
  return snapshot.docs.map((recipeDoc) => ({
    id: recipeDoc.id,
    ...recipeDoc.data(),
  }))
}
