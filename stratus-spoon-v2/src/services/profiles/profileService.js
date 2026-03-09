import { doc, getDoc } from 'firebase/firestore'
import { firebaseAuth, firestoreDb } from '@/lib/firebase'

export async function getCurrentProfile() {
  const currentUser = firebaseAuth?.currentUser

  if (currentUser && firestoreDb) {
    const userRef = doc(firestoreDb, 'users', currentUser.uid)
    const snapshot = await getDoc(userRef)

    if (snapshot.exists()) {
      const profile = snapshot.data()

      return {
        displayName: profile.displayName || currentUser.displayName || 'Stratus Spoon User',
        email: profile.email || currentUser.email || '',
        bio: profile.bio || 'Complete your profile to personalize your cookbook workspace.',
        stats: {
          recipes: profile.recipeCount ?? 0,
          favorites: profile.favoriteRecipeCount ?? 0,
          collections: profile.collectionCount ?? 0,
        },
      }
    }
  }

  return {
    displayName: 'Mara Ellis',
    email: 'mara@stratusspoon.app',
    bio: 'Seasonal home cook collecting bright, practical recipes for busy evenings.',
    stats: {
      recipes: 12,
      favorites: 28,
      collections: 4,
    },
  }
}
