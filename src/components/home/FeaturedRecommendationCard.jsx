import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CookbookFolderPickerModal } from '@/components/cookbook/CookbookFolderPickerModal'
import { FavoriteToggleButton } from '@/components/cookbook/FavoriteToggleButton'
import { AppImage } from '@/components/ui/AppImage'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useImportExternalRecipeMutation } from '@/hooks/useRecipes'

export function FeaturedRecommendationCard({ recipe, index, total }) {
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const importRecipe = useImportExternalRecipeMutation()
  const isLiveApiRecipe = recipe.sourceType === 'api' && String(recipe.id).startsWith('external:')

  return (
    <article className="card-base overflow-hidden">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[320px] overflow-hidden bg-surface-muted lg:min-h-[420px]">
          <AppImage
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
          />
          <div className="absolute left-4 top-4 rounded-full bg-surface/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-dark backdrop-blur">
            Recipe {index + 1} / {total}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-muted">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">{recipe.category}</span>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-accent-dark">{recipe.sourceType}</span>
              <span>{recipe.cookingTime}</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-semibold leading-tight md:text-4xl">{recipe.title}</h3>
              <p className="text-base leading-8 text-text-muted">{recipe.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <FavoriteToggleButton recipe={recipe} />
            {isLiveApiRecipe ? (
              <Button
                type="button"
                variant="secondary"
                className="min-w-0"
                disabled={!isAuthenticated || importRecipe.isPending}
                onClick={() => importRecipe.mutate(recipe)}
              >
                {!isAuthenticated ? 'Log in to import' : importRecipe.isPending ? 'Saving…' : 'Add to My Recipes'}
              </Button>
            ) : null}
            <Button type="button" variant="secondary" className="min-w-0" onClick={() => setIsFolderPickerOpen(true)}>
              Add to Cookbook
            </Button>
            <Button as={Link} to={`/recipes/${recipe.id}`} variant="ghost" className="min-w-0">
              View recipe
            </Button>
          </div>
        </div>
      </div>
      <CookbookFolderPickerModal
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        recipe={recipe}
      />
    </article>
  )
}
