import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { createUserProfile } from '@/services/firebase/firestoreService'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase/firebase'

let phoneRecaptchaVerifier = null
let phoneConfirmationResult = null

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
    if (user) {
      void ensureUserProfile(user)
    }

    callback(mapAuthUser(user))
  })
}

export async function ensureUserProfile(user, profileOverrides = {}) {
  if (!user) {
    return null
  }

  try {
    return await createUserProfile(user, profileOverrides)
  } catch (error) {
    console.warn('Unable to sync Firebase user profile.', error)
    return null
  }
}

export async function loginWithEmail({ email, password }) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password)
  await ensureUserProfile(credentials.user)

  return mapAuthUser(credentials.user)
}

async function loginWithProvider(provider) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  const credentials = await signInWithPopup(firebaseAuth, provider)
  await ensureUserProfile(credentials.user)

  return mapAuthUser(credentials.user)
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return loginWithProvider(provider)
}

export async function loginWithGithub() {
  const provider = new GithubAuthProvider()
  return loginWithProvider(provider)
}

function getPhoneRecaptchaVerifier(containerId) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  if (typeof window === 'undefined') {
    const error = new Error('Phone authentication requires a browser environment.')
    error.code = 'app/phone-browser-required'
    throw error
  }

  if (phoneRecaptchaVerifier) {
    return phoneRecaptchaVerifier
  }

  phoneRecaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
  })

  return phoneRecaptchaVerifier
}

function normalizePhoneNumber(phoneNumber) {
  return phoneNumber.trim()
}

export async function sendPhoneVerificationCode({ phoneNumber, containerId }) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (!normalizedPhoneNumber) {
    const error = new Error('Enter a phone number to receive a verification code.')
    error.code = 'auth/missing-phone-number'
    throw error
  }

  const verifier = getPhoneRecaptchaVerifier(containerId)
  phoneConfirmationResult = await signInWithPhoneNumber(firebaseAuth, normalizedPhoneNumber, verifier)

  return {
    phoneNumber: normalizedPhoneNumber,
  }
}

export async function confirmPhoneVerificationCode({ verificationCode, displayName }) {
  if (!phoneConfirmationResult) {
    const error = new Error('Request a verification code before entering the SMS code.')
    error.code = 'auth/missing-verification-id'
    throw error
  }

  const normalizedCode = verificationCode.trim()

  if (!normalizedCode) {
    const error = new Error('Enter the SMS verification code.')
    error.code = 'auth/missing-verification-code'
    throw error
  }

  const credentials = await phoneConfirmationResult.confirm(normalizedCode)

  if (displayName?.trim() && !credentials.user.displayName) {
    await updateProfile(credentials.user, { displayName: displayName.trim() })
  }

  await ensureUserProfile(credentials.user, { displayName: displayName?.trim() || credentials.user.displayName || '' })
  phoneConfirmationResult = null

  return mapAuthUser(credentials.user)
}

export function resetPhoneVerification() {
  phoneConfirmationResult = null
}

export async function signupWithEmail({ email, password, displayName }) {
  if (!firebaseAuth) {
    throw getConfigError()
  }

  const credentials = await createUserWithEmailAndPassword(firebaseAuth, email, password)

  if (displayName) {
    await updateProfile(credentials.user, { displayName })
  }

  await ensureUserProfile(credentials.user, { displayName })

  return mapAuthUser(credentials.user)
}

export async function logoutUser() {
  if (!firebaseAuth) {
    return
  }

  phoneConfirmationResult = null
  await signOut(firebaseAuth)
}

export async function getAuthStatus() {
  return {
    isConfigured: isFirebaseConfigured,
    isAuthenticated: Boolean(firebaseAuth?.currentUser),
    user: mapAuthUser(firebaseAuth?.currentUser ?? null),
  }
}
