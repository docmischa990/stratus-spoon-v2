import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase'

const SPOONIES_UID = 'spoonies'

export async function ensureSpooniesAccount() {
  if (!firestoreDb) return
  const ref = doc(firestoreDb, 'users', SPOONIES_UID)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: SPOONIES_UID,
      displayName: 'Spoonies',
      username: 'spoonies',
      bio: 'Your weekly curated recipe drops. Follow us to never miss a new favourite.',
      photoURL: null,
      email: '',
      followerCount: 0,
      followingCount: 0,
      recipeCount: 0,
      preferences: { dietaryTags: [], theme: 'warm' },
      isSpoonies: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function autoFollowSpoonies(userId) {
  if (!firestoreDb) return

  const alreadyFollowing = await getDoc(
    doc(firestoreDb, 'users', userId, 'following', SPOONIES_UID),
  )
  if (alreadyFollowing.exists()) return

  const batch = writeBatch(firestoreDb)

  batch.set(doc(firestoreDb, 'users', userId, 'following', SPOONIES_UID), {
    followedAt: serverTimestamp(),
  })
  batch.set(doc(firestoreDb, 'users', SPOONIES_UID, 'followers', userId), {
    followedAt: serverTimestamp(),
  })
  batch.update(doc(firestoreDb, 'users', userId), {
    followingCount: increment(1),
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(firestoreDb, 'users', SPOONIES_UID), {
    followerCount: increment(1),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}
