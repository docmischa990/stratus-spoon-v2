import { motion } from 'framer-motion'
import { useState } from 'react'
import { FavoriteToggleButton } from '@/components/cookbook/FavoriteToggleButton'
import { CookbookFolderPickerModal } from '@/components/cookbook/CookbookFolderPickerModal'
import { Link } from '@/lib/router'
import { Button } from '@/components/ui/Button'
import { AppImage } from '@/components/ui/AppImage'
import { useAuth } from '@/context/useAuth'
import { useImportExternalRecipeMutation } from '@/hooks/useRecipes'
import { fadeUpVariant, pageTransition } from '@/utils/motion'

const MotionArticle = motion.article

export function RecipeCard({ recipe }) {
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const importRecipe = useImportExternalRecipeMutation()
  const isLiveApiRecipe = recipe.sourceType === 'api' && String(recipe.id).startsWith('external:')

  return (
    <MotionArticle
      className="card-base group overflow-hidden"
      variants={fadeUpVariant}
      transition={pageTransition}
      whileHover={{ y: -6 }}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <AppImage
          src={recipe.image}
          alt={recipe.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-muted">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">{recipe.category}</span>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-accent-dark">{recipe.sourceType}</span>
          <span>{recipe.cookingTime}</span>
        </div>
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-xl font-semibold">{recipe.title}</h3>
          <p className="line-clamp-3 text-sm leading-6 text-text-muted">{recipe.description}</p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-text-muted">
                {tag}
              </span>
            ))}
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
              View
            </Button>
          </div>
        </div>
      </div>
      <CookbookFolderPickerModal
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        recipe={recipe}
      />
    </MotionArticle>
  )
}
