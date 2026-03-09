import { FilterPanel } from '@/components/search/FilterPanel'
import { SearchBar } from '@/components/search/SearchBar'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useRecipes } from '@/hooks/useRecipes'
import { useUIStore } from '@/store/uiStore'

export function RecipesPage() {
  const { data: recipes = [], isLoading, isError } = useRecipes()
  const searchQuery = useUIStore((state) => state.searchQuery)
  const filters = useUIStore((state) => state.filters)

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      searchQuery.length === 0 ||
      `${recipe.title} ${recipe.description} ${recipe.tags.join(' ')}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    const matchesCategory = filters.category === 'All' || recipe.category === filters.category
    const matchesTag = filters.tag === 'Any' || recipe.tags.includes(filters.tag)
    const matchesSource = filters.source === 'All' || recipe.sourceType === filters.source

    return matchesSearch && matchesCategory && matchesTag && matchesSource
  })

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Browse"
          title="Recipe discovery with search and filters"
          description="This page uses the future data-management shape already: filter state in Zustand and recipe data in TanStack Query."
        />
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-5">
            <SearchBar />
            <FilterPanel />
          </div>
          {isLoading ? (
            <div className="card-base p-6">
              <p className="text-sm text-text-muted">Loading recipes from the cookbook database…</p>
            </div>
          ) : isError ? (
            <div className="card-base p-6">
              <h3 className="text-xl font-semibold">Unable to load recipes</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Check your Firebase configuration and Firestore indexes, then try again.
              </p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="card-base p-6">
              <h3 className="text-xl font-semibold">No recipes match those filters</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Adjust your query or add some internal recipes to Firestore to populate this view.
              </p>
            </div>
          ) : (
            <RecipeGrid recipes={filteredRecipes} />
          )}
        </div>
      </div>
    </PageSection>
  )
}
