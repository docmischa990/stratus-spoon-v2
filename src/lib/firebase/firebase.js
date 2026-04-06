import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Core config — all 6 keys must be present for Firebase to initialise at all.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// measurementId is opt-in — its absence must never block other Firebase services.
// It is injected into the app config separately so hasFirebaseConfig stays clean.
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp = hasFirebaseConfig
  ? initializeApp({ ...firebaseConfig, ...(measurementId ? { measurementId } : {}) })
  : null;
export const isFirebaseConfigured = hasFirebaseConfig;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestoreDb = firebaseApp
  ? initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    })
  : null;
export const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null;
export const firebaseFunctions = firebaseApp ? getFunctions(firebaseApp) : null;
// measurementId is intentionally excluded from firebaseConfig/hasFirebaseConfig
// so that Analytics being unconfigured never blocks other Firebase services.
// getAnalyticsInstance() is lazy so it always runs client-side, never during SSR.
let _analytics = null
export function getAnalyticsInstance() {
  if (_analytics) return _analytics
  if (!firebaseApp || !measurementId || typeof window === 'undefined') return null
  try {
    _analytics = getAnalytics(firebaseApp)
    return _analytics
  } catch {
    return null
  }
}
