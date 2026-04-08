import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { firebaseAuth, firestoreDb } from '@/lib/firebase'

function commentsRef(recipeId) {
  return collection(firestoreDb, 'recipes', recipeId, 'comments')
}

export async function getComments(recipeId) {
  const q = query(commentsRef(recipeId), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() ?? null,
  }))
}

export async function addComment(recipeId, text) {
  const currentUser = firebaseAuth?.currentUser
  if (!currentUser || !firestoreDb) throw new Error('Must be signed in to comment.')

  const trimmed = text.trim().slice(0, 500)
  if (!trimmed) throw new Error('Comment cannot be empty.')

  return addDoc(commentsRef(recipeId), {
    userId: currentUser.uid,
    displayName: currentUser.displayName || 'Anonymous',
    text: trimmed,
    createdAt: serverTimestamp(),
  })
}

export async function deleteComment(recipeId, commentId) {
  const currentUser = firebaseAuth?.currentUser
  if (!currentUser || !firestoreDb) throw new Error('Must be signed in.')
  await deleteDoc(doc(firestoreDb, 'recipes', recipeId, 'comments', commentId))
}
