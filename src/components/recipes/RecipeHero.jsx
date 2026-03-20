import { useState } from 'react'
import { CookbookFolderPickerModal } from '@/components/cookbook/CookbookFolderPickerModal'
import { Button } from '@/components/ui/Button'
import { AppImage } from '@/components/ui/AppImage'
import { FavoriteToggleButton } from '@/components/cookbook/FavoriteToggleButton'
import { useAuth } from '@/context/useAuth'
import { useImportExternalRecipeMutation } from '@/hooks/useRecipes'

export function RecipeHero({ recipe }) {
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const importRecipe = useImportExternalRecipeMutation()
  const isLiveApiRecipe = recipe.sourceType === 'api' && String(recipe.id).startsWith('external:')

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 text-sm text-text-muted">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">{recipe.category}</span>
          {recipe.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-muted px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold md:text-5xl">{recipe.title}</h1>
          <p className="max-w-prose text-lg leading-8 text-text-muted">{recipe.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FavoriteToggleButton recipe={recipe} variant="primary" />
          {isLiveApiRecipe ? (
            <Button
              type="button"
              variant="secondary"
              disabled={!isAuthenticated || importRecipe.isPending}
              onClick={() => importRecipe.mutate(recipe)}
            >
              {!isAuthenticated ? 'Log in to import' : importRecipe.isPending ? 'Saving…' : 'Add to My Recipes'}
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={() => setIsFolderPickerOpen(true)}>
            Add to Cookbook
          </Button>
          <Button variant="ghost">Edit later</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-border shadow-card">
        <AppImage
          src={recipe.image}
          alt={recipe.title}
          className="aspect-[4/3] h-full w-full object-cover"
        />
      </div>
      <CookbookFolderPickerModal
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        recipe={recipe}
      />
    </section>
  )
}
