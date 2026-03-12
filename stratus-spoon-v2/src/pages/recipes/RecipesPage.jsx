import { FilterPanel } from '@/components/search/FilterPanel'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/search/SearchBar'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useRecipes } from '@/hooks/useRecipes'
import { useUIStore } from '@/store/uiStore'

export function RecipesPage() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const filters = useUIStore((state) => state.filters)
  const { data, error, isLoading, isError, isFetchingNextPage, fetchNextPage, hasNextPage } = useRecipes({
    searchQuery,
    filters,
  })
  const recipes = data?.pages?.flatMap((page) => page.recipes ?? []) ?? []

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory = filters.category === 'All' || recipe.category === filters.category
    const matchesTag = filters.tag === 'Any' || recipe.tags.includes(filters.tag)
    const matchesSource = filters.source === 'All' || recipe.sourceType === filters.source

    return matchesCategory && matchesTag && matchesSource
  })

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Browse"
          title="Recipe discovery with search and filters"
          description="Browse local cookbook entries and live Spoonacular catalog results from the same search surface."
        />
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-5">
            <SearchBar />
            <FilterPanel />
          </div>
          {isLoading ? (
            <div className="card-base p-6">
              <p className="text-sm text-text-muted">Loading local and API recipes…</p>
            </div>
          ) : isError ? (
            <div className="card-base p-6">
              <h3 className="text-xl font-semibold">Unable to load recipes</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                {error?.message ||
                  'Check your Firebase configuration, Firestore indexes, and recipe proxy configuration, then try again.'}
              </p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="card-base p-6">
              <h3 className="text-xl font-semibold">No recipes match those filters</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Adjust your query, update filters, or try a different search to expand the live Spoonacular results.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <RecipeGrid recipes={filteredRecipes} />
              {filters.source !== 'internal' && hasNextPage ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                  >
                    {isFetchingNextPage ? 'Loading more…' : 'Load more API recipes'}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </PageSection>
  )
}
