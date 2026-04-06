import {
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase'

const STATS_DEFAULTS = {
  viewCount: 0,
  likeCount: 0,
  dislikeCount: 0,
  favoriteCount: 0,
  importCount: 0,
}

const VALID_STAT_FIELDS = new Set(Object.keys(STATS_DEFAULTS))

export async function getRecipeStats(recipeId) {
  if (!firestoreDb || !recipeId) return { ...STATS_DEFAULTS }

  const ref = doc(firestoreDb, 'recipeStats', recipeId)
  const snap = await getDoc(ref)

  if (!snap.exists()) return { ...STATS_DEFAULTS }

  return { ...STATS_DEFAULTS, ...snap.data() }
}

export async function getMultipleRecipeStats(recipeIds) {
  if (!firestoreDb || !recipeIds?.length) return {}

  const results = await Promise.all(
    recipeIds.map(async (id) => {
      const stats = await getRecipeStats(id)
      return [id, stats]
    })
  )

  return Object.fromEntries(results)
}

export async function incrementStat({ recipeId, field }) {
  if (!firestoreDb || !recipeId || !field || !VALID_STAT_FIELDS.has(field)) return

  const ref = doc(firestoreDb, 'recipeStats', recipeId)

  await setDoc(
    ref,
    {
      recipeId,
      [field]: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function decrementStat({ recipeId, field }) {
  if (!firestoreDb || !recipeId || !field || !VALID_STAT_FIELDS.has(field)) return

  const ref = doc(firestoreDb, 'recipeStats', recipeId)

  await setDoc(
    ref,
    {
      recipeId,
      [field]: increment(-1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
