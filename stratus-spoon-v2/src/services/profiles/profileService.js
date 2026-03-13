import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { firebaseAuth, firestoreDb } from '@/lib/firebase'

async function getCurrentProfileStats(userId) {
  const [favoritesSnapshot, collectionsSnapshot, recipesSnapshot] = await Promise.all([
    getDocs(collection(firestoreDb, 'users', userId, 'favorites')),
    getDocs(collection(firestoreDb, 'users', userId, 'collections')),
    getDocs(
      query(
        collection(firestoreDb, 'recipes'),
        where('ownerId', '==', userId),
        where('sourceType', '==', 'internal'),
      ),
    ),
  ])

  return {
    recipes: recipesSnapshot.size,
    favorites: favoritesSnapshot.size,
    collections: collectionsSnapshot.size,
  }
}

export async function getCurrentProfile() {
  const currentUser = firebaseAuth?.currentUser

  if (currentUser && firestoreDb) {
    const userRef = doc(firestoreDb, 'users', currentUser.uid)
    const snapshot = await getDoc(userRef)

    if (snapshot.exists()) {
      const profile = snapshot.data()
      const stats = await getCurrentProfileStats(currentUser.uid)

      if (
        profile.recipeCount !== stats.recipes ||
        profile.favoriteRecipeCount !== stats.favorites ||
        profile.collectionCount !== stats.collections
      ) {
        await updateDoc(userRef, {
          recipeCount: stats.recipes,
          favoriteRecipeCount: stats.favorites,
          collectionCount: stats.collections,
          updatedAt: serverTimestamp(),
        })
      }

      return {
        uid: currentUser.uid,
        displayName: profile.displayName || currentUser.displayName || 'Stratus Spoon User',
        email: profile.email || currentUser.email || '',
        bio: profile.bio || 'Complete your profile to personalize your cookbook workspace.',
        preferences: {
          dietaryTags: Array.isArray(profile.preferences?.dietaryTags)
            ? profile.preferences.dietaryTags
            : [],
          theme: profile.preferences?.theme ?? 'warm',
        },
        stats,
      }
    }
  }

  return {
    uid: 'local-profile',
    displayName: 'Mara Ellis',
    email: 'mara@stratusspoon.app',
    bio: 'Seasonal home cook collecting bright, practical recipes for busy evenings.',
    preferences: {
      dietaryTags: ['vegetarian'],
      theme: 'warm',
    },
    stats: {
      recipes: 12,
      favorites: 28,
      collections: 4,
    },
  }
}

function requireCurrentUser() {
  const currentUser = firebaseAuth?.currentUser

  if (!currentUser || !firestoreDb) {
    throw new Error('You must be logged in with Firebase configured to manage your profile.')
  }

  return currentUser
}

export async function updateCurrentProfile({ displayName, bio }) {
  const currentUser = requireCurrentUser()
  const userRef = doc(firestoreDb, 'users', currentUser.uid)

  await updateDoc(userRef, {
    displayName: displayName.trim(),
    bio: bio.trim(),
    updatedAt: serverTimestamp(),
  })

  return getCurrentProfile()
}

export async function updateCurrentPreferences(preferences) {
  const currentUser = requireCurrentUser()
  const userRef = doc(firestoreDb, 'users', currentUser.uid)

  await updateDoc(userRef, {
    preferences,
    updatedAt: serverTimestamp(),
  })

  return getCurrentProfile()
}

async function deleteCollectionEntries(userId, collectionId) {
  const recipesRef = collection(firestoreDb, 'users', userId, 'collections', collectionId, 'recipes')
  const recipeDocs = await getDocs(recipesRef)

  await Promise.all(
    recipeDocs.docs.map((recipeDoc) =>
      deleteDoc(doc(firestoreDb, 'users', userId, 'collections', collectionId, 'recipes', recipeDoc.id)),
    ),
  )
}

export async function deleteCurrentUserData() {
  const currentUser = requireCurrentUser()
  const userId = currentUser.uid
  const userRef = doc(firestoreDb, 'users', userId)

  const [favoritesSnapshot, collectionsSnapshot, recipesSnapshot] = await Promise.all([
    getDocs(collection(firestoreDb, 'users', userId, 'favorites')),
    getDocs(query(collection(firestoreDb, 'users', userId, 'collections'), orderBy('updatedAt', 'desc'))),
    getDocs(
      query(
        collection(firestoreDb, 'recipes'),
        where('ownerId', '==', userId),
        where('sourceType', '==', 'internal'),
      ),
    ),
  ])

  await Promise.all(
    favoritesSnapshot.docs.map((favoriteDoc) =>
      deleteDoc(doc(firestoreDb, 'users', userId, 'favorites', favoriteDoc.id)),
    ),
  )

  await Promise.all(
    collectionsSnapshot.docs.map(async (collectionDoc) => {
      await deleteCollectionEntries(userId, collectionDoc.id)
      await deleteDoc(doc(firestoreDb, 'users', userId, 'collections', collectionDoc.id))
    }),
  )

  await Promise.all(
    recipesSnapshot.docs.map((recipeDoc) => deleteDoc(doc(firestoreDb, 'recipes', recipeDoc.id))),
  )

  await deleteDoc(userRef)
}
