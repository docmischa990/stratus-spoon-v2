import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { firebaseStorage } from '@/lib/firebase/firebase'

function assertStorageConfigured() {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage is not configured.')
  }
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '-')
}

async function uploadFile(storagePath, file) {
  assertStorageConfigured()

  const fileRef = ref(firebaseStorage, storagePath)
  await uploadBytes(fileRef, file, {
    contentType: file.type,
  })

  const url = await getDownloadURL(fileRef)

  return {
    storagePath: fileRef.fullPath,
    url,
  }
}

export async function uploadRecipeImage({ ownerId, recipeId, imageFile }) {
  const safeName = sanitizeFileName(imageFile.name)
  return uploadFile(`recipe-images/${ownerId}/${recipeId}/${Date.now()}-${safeName}`, imageFile)
}

export async function uploadProfileImage({ userId, imageFile }) {
  const safeName = sanitizeFileName(imageFile.name)
  return uploadFile(`profile-images/${userId}/${Date.now()}-${safeName}`, imageFile)
}
