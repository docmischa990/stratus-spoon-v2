import { useEffect } from 'react'
import { useParams } from '@/lib/router'
import { OwnerRecipeActions } from '@/components/recipes/OwnerRecipeActions'
import { IngredientList } from '@/components/recipes/IngredientList'
import { NotesSection } from '@/components/recipes/NotesSection'
import { RecipeHero } from '@/components/recipes/RecipeHero'
import { StepList } from '@/components/recipes/StepList'
import { PageSection } from '@/components/ui/PageSection'
import { useAuth } from '@/context/useAuth'
import { useRecipe } from '@/hooks/useRecipes'
import { trackRecipeView } from '@/services/analytics/analyticsService'

export function RecipeDetailsPage() {
  const { recipeId } = useParams()
  const { user } = useAuth()
  const { data: recipe, isLoading, isError } = useRecipe(recipeId)

  useEffect(() => {
    if (!recipe) return
    trackRecipeView({
      recipeId: recipe.id,
      title: recipe.title,
      source: recipe.sourceType === 'internal' ? 'internal' : 'external',
    })
  }, [recipe?.id])

  if (isLoading) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading recipe details…</p>
          </div>
        </div>
      </PageSection>
    )
  }

  if (isError) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <div className="card-base p-6">
            <h1 className="text-3xl font-semibold">Recipe unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Firestore rejected this lookup or the recipe document is missing required fields.
            </p>
          </div>
        </div>
      </PageSection>
    )
  }

  if (!recipe) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <div className="card-base p-6">
            <h1 className="text-3xl font-semibold">Recipe not found</h1>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              The recipe does not exist, is private, or is not readable for the current session.
            </p>
          </div>
        </div>
      </PageSection>
    )
  }

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-10">
        <RecipeHero recipe={recipe} />
        {recipe.ownerId === user?.uid ? <OwnerRecipeActions recipeId={recipe.id} /> : null}
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <IngredientList ingredients={recipe.ingredients} />
          </div>
          <div className="space-y-8">
            <StepList steps={recipe.steps} />
            <NotesSection notes={recipe.notes} />
          </div>
        </div>
      </div>
    </PageSection>
  )
}
