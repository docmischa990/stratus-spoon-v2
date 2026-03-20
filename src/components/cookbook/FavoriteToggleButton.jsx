import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useFavoriteStatus, useToggleFavorite } from '@/hooks/useCookbook'

export function FavoriteToggleButton({ recipe, variant = 'ghost', className = '' }) {
  const { isAuthenticated } = useAuth()
  const { data: isFavorited = false } = useFavoriteStatus(recipe.id, { enabled: isAuthenticated })
  const toggleFavorite = useToggleFavorite(recipe)

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={toggleFavorite.isPending || !isAuthenticated}
      onClick={() => toggleFavorite.mutate(isFavorited)}
    >
      {!isAuthenticated ? 'Log in to favorite' : toggleFavorite.isPending ? 'Saving…' : isFavorited ? 'Favorited' : 'Favorite'}
    </Button>
  )
}
