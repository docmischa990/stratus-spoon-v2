import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { createUserProfile } from '@/services/firebase/firestoreService'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase/firebase'

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

export async function loginWithEmail({ email, password }) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password)
  await createUserProfile(credentials.user)

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

  await createUserProfile(credentials.user, { displayName })

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
