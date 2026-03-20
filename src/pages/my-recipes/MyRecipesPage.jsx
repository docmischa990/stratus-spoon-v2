import { CookbookRecipeSection } from '@/components/cookbook/CookbookRecipeSection'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCookbook } from '@/hooks/useCookbook'

export function MyRecipesPage() {
  const { data: cookbook, isLoading, isError } = useCookbook()

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="My Recipes"
          title="Recipes you created or imported"
          description="This page is for user-owned recipes only, including recipes you imported from Spoonacular into your own collection."
        />
        {isLoading ? (
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading your recipes…</p>
          </div>
        ) : isError ? (
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold">My recipes unavailable</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Check your Firebase authentication state and recipe queries, then try again.
            </p>
          </div>
        ) : (
          <CookbookRecipeSection
            title="Your recipe library"
            description="Internal recipes you created directly or saved from the live API catalog."
            recipes={cookbook?.createdRecipes ?? []}
            emptyState="Create a recipe or add a live API recipe to My Recipes to see it here."
          />
        )}
      </div>
    </PageSection>
  )
}
