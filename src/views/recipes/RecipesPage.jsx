import { FilterPanel } from '@/components/search/FilterPanel'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/search/SearchBar'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useRecipes } from '@/hooks/useRecipes'
import { useUIStore } from '@/store/uiStore'

function normalizeValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function RecipesPage() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const filters = useUIStore((state) => state.filters)
  const { data, error, isLoading, isError, isFetchingNextPage, fetchNextPage, hasNextPage } = useRecipes({
    searchQuery,
    filters,
  })
  const pages = data?.pages ?? []
  const recipes = pages.flatMap((page) => page.recipes ?? [])
  const externalError = pages.find((page) => page.externalError)?.externalError ?? null
  const isApiOnlyView = filters.source === 'api'
  const shouldShowLoadMore = filters.source !== 'internal' && hasNextPage
  const filteredRecipes = recipes.filter((recipe) => {
    const recipeCategory = normalizeValue(recipe.category)
    const recipeTags = Array.isArray(recipe.tags) ? recipe.tags.map(normalizeValue) : []
    const recipeSource = normalizeValue(recipe.sourceType)

    const matchesCategory =
      filters.category === 'All' || recipeCategory === normalizeValue(filters.category)
    const matchesTag = filters.tag === 'Any' || recipeTags.includes(normalizeValue(filters.tag))
    const matchesSource = filters.source === 'All' || recipeSource === normalizeValue(filters.source)

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
          ) : externalError && isApiOnlyView ? (
            <div className="card-base p-6">
              <h3 className="text-xl font-semibold">Live API recipes unavailable</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">{externalError}</p>
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
              {externalError ? (
                <div className="card-base p-5">
                  <p className="text-sm leading-6 text-text-muted">
                    Live API recipes are partially unavailable. Showing the recipes that loaded successfully.
                  </p>
                  <p className="mt-2 text-sm font-medium text-text-muted">{externalError}</p>
                </div>
              ) : null}
              <RecipeGrid recipes={filteredRecipes} />
              {shouldShowLoadMore ? (
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
