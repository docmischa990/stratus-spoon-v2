import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreDb } from '@/lib/firebase/firebase'

function pantryRef(uid) {
  return collection(firestoreDb, 'users', uid, 'pantry')
}

/**
 * Keyword → category mapping used for automatic categorisation.
 * Order matters: first match wins.
 */
const CATEGORY_MAP = [
  { category: 'Meat & Seafood', keywords: ['chicken', 'beef', 'pork', 'lamb', 'salmon', 'tuna', 'shrimp', 'bacon', 'turkey', 'fish', 'mince'] },
  { category: 'Dairy', keywords: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'egg', 'eggs'] },
  { category: 'Vegetables', keywords: ['carrot', 'onion', 'garlic', 'tomato', 'potato', 'spinach', 'broccoli', 'pepper', 'celery', 'zucchini', 'mushroom', 'lettuce', 'cabbage', 'leek', 'pea', 'corn'] },
  { category: 'Fruits', keywords: ['apple', 'banana', 'lemon', 'lime', 'orange', 'berry', 'berries', 'mango', 'avocado', 'grape', 'strawberry'] },
  { category: 'Grains & Pasta', keywords: ['flour', 'rice', 'pasta', 'bread', 'oat', 'oats', 'noodle', 'quinoa', 'barley', 'couscous', 'breadcrumb'] },
  { category: 'Spices & Condiments', keywords: ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'thyme', 'basil', 'cinnamon', 'soy', 'vinegar', 'mustard', 'sauce', 'oil', 'honey', 'sugar', 'chili', 'chilli'] },
  { category: 'Canned & Pantry', keywords: ['can', 'tin', 'beans', 'lentil', 'chickpea', 'stock', 'broth', 'coconut', 'tomatoes'] },
]

export function categoriseIngredient(name) {
  const lower = name.toLowerCase()
  for (const { category, keywords } of CATEGORY_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return 'Other'
}

export async function getPantry(uid) {
  const q = query(pantryRef(uid), orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addIngredient(uid, { name, quantity = '', unit = '' }) {
  const category = categoriseIngredient(name)
  return addDoc(pantryRef(uid), {
    name: name.trim(),
    quantity,
    unit,
    category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateIngredient(uid, ingredientId, updates) {
  const ref = doc(firestoreDb, 'users', uid, 'pantry', ingredientId)
  return updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
}

export async function deleteIngredient(uid, ingredientId) {
  const ref = doc(firestoreDb, 'users', uid, 'pantry', ingredientId)
  return deleteDoc(ref)
}
