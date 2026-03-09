import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { firebaseAuth, firestoreDb, isFirebaseConfigured } from '@/lib/firebase'

function getConfigError() {
  const error = new Error('Firebase is not configured. Add the required Vite environment variables.')
  error.code = 'app/firebase-not-configured'
  return error
}

export function mapAuthUser(user) {
  if (!user) {
    return null
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

export function subscribeToAuthState(callback) {
  if (!firebaseAuth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(firebaseAuth, (user) => {
    callback(mapAuthUser(user))
  })
}

async function ensureUserProfileDocument(user, displayName = user.displayName ?? '') {
  if (!firestoreDb) {
    return
  }

  const userRef = doc(firestoreDb, 'users', user.uid)
  const existingSnapshot = await getDoc(userRef)

  if (existingSnapshot.exists()) {
    await setDoc(
      userRef,
      {
        email: user.email,
        displayName: user.displayName ?? displayName,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    return
  }

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? displayName,
    photoURL: user.photoURL ?? null,
    bio: '',
    recipeCount: 0,
    favoriteRecipeCount: 0,
    collectionCount: 0,
    preferences: {
      dietaryTags: [],
      theme: null,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function loginWithEmail({ email, password }) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password)
  await ensureUserProfileDocument(credentials.user)

  return mapAuthUser(credentials.user)
}

export async function signupWithEmail({ email, password, displayName }) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  const credentials = await createUserWithEmailAndPassword(firebaseAuth, email, password)

  if (displayName) {
    await updateProfile(credentials.user, { displayName })
  }

  await ensureUserProfileDocument(credentials.user, displayName)

  return mapAuthUser(credentials.user)
}

export async function logoutUser() {
  if (!firebaseAuth) {
    return
  }

  await signOut(firebaseAuth)
}

export async function getAuthStatus() {
  return {
    isConfigured: isFirebaseConfigured,
    isAuthenticated: Boolean(firebaseAuth?.currentUser),
    user: mapAuthUser(firebaseAuth?.currentUser ?? null),
  }
}
