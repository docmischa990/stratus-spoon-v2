export async function getImageGenerationPresets() {
  return [
    'Soft daylight editorial',
    'Rustic kitchen counter',
    'Minimal ceramic plating',
  ]
}

const IMAGE_GENERATION_TIMEOUT_MS = 180000

function getImageServiceEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL?.trim()

  if (!baseUrl) {
    throw new Error('AI image generation is not configured for this environment.')
  }

  return `${baseUrl.replace(/\/+$/, '')}/generate-image`
}

function mapImageGenerationError(error) {
  if (error?.name === 'AbortError') {
    return new Error('Image generation timed out. Please try again.')
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Unable to generate an AI image right now.')
}

export async function generateRecipeImage({ title, description, recipeId = 'draft' }) {
  void recipeId

  if (!title?.trim()) {
    throw new Error('Recipe title is required to generate an AI image.')
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, IMAGE_GENERATION_TIMEOUT_MS)

  try {
    const response = await fetch(getImageServiceEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description?.trim() ?? '',
      }),
      signal: controller.signal,
    })

    let payload = null

    try {
      payload = await response.json()
    } catch {
      throw new Error('Image generation returned an invalid response.')
    }

    if (!response.ok) {
      throw new Error(payload?.message || 'AI image generation failed. Please try again.')
    }

    if (!payload?.imageUrl || typeof payload.imageUrl !== 'string') {
      throw new Error('Image generation did not return a valid image URL.')
    }

    return {
      image: {
        url: payload.imageUrl,
        storagePath: null,
        type: 'external',
      },
      prompt: payload.prompt ?? '',
      remaining: payload.remaining,
    }
  } catch (error) {
    throw mapImageGenerationError(error)
  } finally {
    window.clearTimeout(timeoutId)
  }
}
