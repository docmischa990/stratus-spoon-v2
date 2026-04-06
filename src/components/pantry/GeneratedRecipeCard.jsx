import { AppImage } from '@/components/ui/AppImage'
import { Button } from '@/components/ui/Button'

export function GeneratedRecipeCard({ recipe, onUseRecipe, isApplying }) {
  return (
    <div className="card-base overflow-hidden">
      <AppImage
        src={recipe.image}
        alt={recipe.title}
        className="h-36 w-full object-cover"
      />
      <div className="p-4 space-y-2">
        <h3 className="font-heading font-semibold leading-snug">{recipe.title}</h3>
        <div className="flex gap-3 text-xs text-text-muted">
          <span>{recipe.usedIngredientCount} ingredients matched</span>
          {recipe.missedIngredientCount > 0 && (
            <span>{recipe.missedIngredientCount} missing</span>
          )}
        </div>
        {recipe.cookingTime && (
          <p className="text-xs text-text-muted">{recipe.cookingTime}</p>
        )}
        <Button
          className="w-full mt-2"
          onClick={() => onUseRecipe(recipe)}
          disabled={isApplying}
        >
          {isApplying ? 'Deducting ingredients…' : 'Use this recipe'}
        </Button>
      </div>
    </div>
  )
}
