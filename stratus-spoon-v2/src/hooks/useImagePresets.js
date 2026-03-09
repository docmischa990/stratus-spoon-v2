import { useQuery } from '@tanstack/react-query'
import { getImageGenerationPresets } from '@/services/images/imageService'

export function useImagePresets() {
  return useQuery({
    queryKey: ['image-presets'],
    queryFn: getImageGenerationPresets,
  })
}
