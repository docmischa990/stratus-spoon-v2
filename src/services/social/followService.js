import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { firebaseAuth, firestoreDb } from '@/lib/firebase'

function requireAuth() {
  const user = firebaseAuth?.currentUser
  if (!user || !firestoreDb) throw new Error('Must be signed in.')
  return user
}

export async function followUser(targetUid) {
  const currentUser = requireAuth()
  if (currentUser.uid === targetUid) throw new Error('You cannot follow yourself.')

  const batch = writeBatch(firestoreDb)

  batch.set(
    doc(firestoreDb, 'users', currentUser.uid, 'following', targetUid),
    { followedAt: serverTimestamp() },
  )
  batch.set(
    doc(firestoreDb, 'users', targetUid, 'followers', currentUser.uid),
    { followedAt: serverTimestamp() },
  )
  batch.update(doc(firestoreDb, 'users', currentUser.uid), {
    followingCount: increment(1),
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(firestoreDb, 'users', targetUid), {
    followerCount: increment(1),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}

export async function unfollowUser(targetUid) {
  const currentUser = requireAuth()

  const batch = writeBatch(firestoreDb)

  batch.delete(doc(firestoreDb, 'users', currentUser.uid, 'following', targetUid))
  batch.delete(doc(firestoreDb, 'users', targetUid, 'followers', currentUser.uid))

  batch.update(doc(firestoreDb, 'users', currentUser.uid), {
    followingCount: increment(-1),
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(firestoreDb, 'users', targetUid), {
    followerCount: increment(-1),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}

export async function isFollowing(targetUid) {
  const currentUser = firebaseAuth?.currentUser
  if (!currentUser || !firestoreDb) return false
  const snap = await getDoc(
    doc(firestoreDb, 'users', currentUser.uid, 'following', targetUid),
  )
  return snap.exists()
}

export async function getPublicProfile(uid) {
  if (!firestoreDb) return null
  const snap = await getDoc(doc(firestoreDb, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid,
    displayName: data.displayName || 'Stratus Spoon User',
    username: data.username || null,
    bio: data.bio || '',
    photoURL: data.photoURL || null,
    followerCount: data.followerCount ?? 0,
    followingCount: data.followingCount ?? 0,
    recipeCount: data.recipeCount ?? 0,
  }
}

export async function getFollowers(uid) {
  if (!firestoreDb) return []
  const snap = await getDocs(collection(firestoreDb, 'users', uid, 'followers'))
  return snap.docs.map((d) => d.id)
}

export async function getFollowing(uid) {
  if (!firestoreDb) return []
  const snap = await getDocs(collection(firestoreDb, 'users', uid, 'following'))
  return snap.docs.map((d) => d.id)
}
