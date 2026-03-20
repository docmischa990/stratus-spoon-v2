import { useMutation, useQuery } from '@tanstack/react-query'
import { generateRecipeImage, getImageGenerationPresets } from '@/services/images/imageService'

export function useImagePresets() {
  return useQuery({
    queryKey: ['image-presets'],
    queryFn: getImageGenerationPresets,
  })
}

export function useGenerateRecipeImageMutation() {
  return useMutation({
    mutationFn: generateRecipeImage,
  })
}
