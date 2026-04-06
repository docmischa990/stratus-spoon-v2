import { logEvent as firebaseLogEvent } from 'firebase/analytics'
import { getAnalyticsInstance } from '@/lib/firebase'

function logEvent(eventName, params = {}) {
  const analytics = getAnalyticsInstance()
  if (!analytics) {
    return
  }

  try {
    firebaseLogEvent(analytics, eventName, params)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[analytics] Failed to log event:', eventName, error)
    }
  }
}

export function trackRecipeView({ recipeId, title, source }) {
  logEvent('recipe_view', {
    recipe_id: recipeId,
    recipe_title: title,
    source,
  })
}

export function trackSearchQuery({ searchTerm, resultCount }) {
  logEvent('search_query', {
    search_term: searchTerm,
    result_count: resultCount,
  })
}

export function trackRecipeCreated({ recipeId, hasImage, usedAiImage }) {
  logEvent('recipe_created', {
    recipe_id: recipeId,
    has_image: hasImage,
    used_ai_image: usedAiImage,
  })
}

export function trackRecipeImported({ recipeId, source }) {
  logEvent('recipe_imported', {
    recipe_id: recipeId,
    source,
  })
}

export function trackFavoriteAdded({ recipeId, recipeTitle }) {
  logEvent('favorite_added', {
    recipe_id: recipeId,
    recipe_title: recipeTitle,
  })
}

export function trackFavoriteRemoved({ recipeId, recipeTitle }) {
  logEvent('favorite_removed', {
    recipe_id: recipeId,
    recipe_title: recipeTitle,
  })
}

export function trackCollectionCreated({ collectionName }) {
  logEvent('collection_created', {
    collection_name: collectionName,
  })
}

export function trackRecipeAddedToCollection({ recipeId, collectionId }) {
  logEvent('recipe_added_to_collection', {
    recipe_id: recipeId,
    collection_id: collectionId,
  })
}

export function trackRecipeRemovedFromCollection({ recipeId, collectionId }) {
  logEvent('recipe_removed_from_collection', {
    recipe_id: recipeId,
    collection_id: collectionId,
  })
}

export function trackAiImageGenerated({ recipeId, recipeTitle, success }) {
  logEvent('ai_image_generated', {
    recipe_id: recipeId,
    recipe_title: recipeTitle,
    success,
  })
}
