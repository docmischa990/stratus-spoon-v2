import { doc, increment, setDoc, updateDoc } from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase'

export async function ensureProfileDocument(userId) {
  if (!firestoreDb || !userId) {
    return
  }

  const userRef = doc(firestoreDb, 'users', userId)

  await setDoc(
    userRef,
    {
      uid: userId,
    },
    { merge: true },
  )
}

export async function adjustProfileCounters(userId, counters) {
  if (!firestoreDb || !userId) {
    return
  }

  await ensureProfileDocument(userId)

  const userRef = doc(firestoreDb, 'users', userId)
  const updates = {}

  if (typeof counters.recipeCount === 'number') {
    updates.recipeCount = increment(counters.recipeCount)
  }

  if (typeof counters.favoriteRecipeCount === 'number') {
    updates.favoriteRecipeCount = increment(counters.favoriteRecipeCount)
  }

  if (typeof counters.collectionCount === 'number') {
    updates.collectionCount = increment(counters.collectionCount)
  }

  if (Object.keys(updates).length === 0) {
    return
  }

  await updateDoc(userRef, updates)
}
