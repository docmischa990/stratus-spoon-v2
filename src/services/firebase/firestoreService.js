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
  writeBatch,
} from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase/firebase'

function generateDefaultUsername(displayName, uid) {
  const base = (displayName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) || 'user'
  return `${base}${uid.slice(0, 6)}`
}

function assertFirestoreConfigured() {
  if (!firestoreDb) {
    throw new Error('Firestore is not configured.')
  }
}

export async function createUserProfile(user, profileOverrides = {}) {
  assertFirestoreConfigured()

  const userRef = doc(firestoreDb, 'users', user.uid)
  const userSnapshot = await getDoc(userRef)
  const existingData = userSnapshot.exists() ? userSnapshot.data() : null

  const profileData = {
    uid: user.uid,
    email: user.email ?? existingData?.email ?? '',
    displayName: profileOverrides.displayName ?? user.displayName ?? existingData?.displayName ?? '',
    photoURL: profileOverrides.photoURL ?? user.photoURL ?? existingData?.photoURL ?? null,
    bio: profileOverrides.bio ?? existingData?.bio ?? '',
    username: existingData?.username ?? generateDefaultUsername(
      profileOverrides.displayName ?? user.displayName,
      user.uid,
    ),
    recipeCount: profileOverrides.recipeCount ?? existingData?.recipeCount ?? 0,
    favoriteRecipeCount: profileOverrides.favoriteRecipeCount ?? existingData?.favoriteRecipeCount ?? 0,
    collectionCount: profileOverrides.collectionCount ?? existingData?.collectionCount ?? 0,
    followerCount: existingData?.followerCount ?? 0,
    followingCount: existingData?.followingCount ?? 0,
    preferences: profileOverrides.preferences ?? existingData?.preferences ?? {
      dietaryTags: [],
      theme: null,
    },
    updatedAt: serverTimestamp(),
  }

  const shouldWriteProfile =
    !existingData ||
    existingData.email !== profileData.email ||
    existingData.displayName !== profileData.displayName ||
    existingData.photoURL !== profileData.photoURL ||
    existingData.bio !== profileData.bio

  if (!shouldWriteProfile) {
    return existingData
  }

  const batch = writeBatch(firestoreDb)

  batch.set(
    userRef,
    {
      ...profileData,
      createdAt: userSnapshot.exists() ? userSnapshot.data().createdAt ?? serverTimestamp() : serverTimestamp(),
    },
    { merge: true },
  )

  // Write username lookup doc (only on new profile creation)
  if (!existingData) {
    const usernameRef = doc(firestoreDb, 'usernames', profileData.username)
    batch.set(usernameRef, { uid: user.uid, createdAt: serverTimestamp() })
  }

  await batch.commit()

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
