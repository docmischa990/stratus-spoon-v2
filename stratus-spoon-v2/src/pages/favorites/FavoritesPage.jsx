import { CookbookRecipeSection } from '@/components/cookbook/CookbookRecipeSection'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCookbook } from '@/hooks/useCookbook'

export function FavoritesPage() {
  const { data: cookbook, isLoading, isError } = useCookbook()

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Favorites"
          title="Quick access to bookmarked recipes"
          description="Favorites are your lightweight save layer, separate from cookbook folders and your owned recipes."
        />
        {isLoading ? (
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading favorite recipes…</p>
          </div>
        ) : isError ? (
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold">Favorites unavailable</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Check your Firebase authentication state and cookbook queries, then try again.
            </p>
          </div>
        ) : (
          <CookbookRecipeSection
            title="Favorite recipes"
            description="Recipes you bookmarked for quick return visits."
            recipes={cookbook?.favoriteRecipes ?? []}
            emptyState="Favorite a recipe to keep it here."
          />
        )}
      </div>
    </PageSection>
  )
}
