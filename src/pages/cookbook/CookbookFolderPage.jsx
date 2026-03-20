import { Link, useParams } from 'react-router-dom'
import { CollectionFormCard } from '@/components/cookbook/CollectionFormCard'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'
import { Button } from '@/components/ui/Button'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCookbook, useToggleCollectionRecipe } from '@/hooks/useCookbook'

export function CookbookFolderPage() {
  const { collectionId } = useParams()
  const { data: cookbook, isLoading, isError } = useCookbook()
  const toggleCollectionRecipe = useToggleCollectionRecipe(null)
  const collection = cookbook?.collections?.find((entry) => entry.id === collectionId) ?? null

  if (isLoading) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading your cookbook folder…</p>
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
            <h1 className="text-3xl font-semibold">Folder unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Check your Firebase authentication state and cookbook queries, then try again.
            </p>
          </div>
        </div>
      </PageSection>
    )
  }

  if (!collection) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <div className="card-base space-y-4 p-6">
            <h1 className="text-3xl font-semibold">Folder not found</h1>
            <p className="text-sm leading-6 text-text-muted">
              That cookbook folder does not exist or is not available in the current session.
            </p>
            <Button as={Link} to="/cookbook" variant="secondary">
              Back to Cookbook
            </Button>
          </div>
        </div>
      </PageSection>
    )
  }

  const folderRecipes = (collection.recipes ?? []).map((entry) => ({
    id: entry.recipeId,
    title: entry.recipeSnapshot?.title ?? 'Saved recipe',
    description: '',
    image:
      entry.recipeSnapshot?.imageUrl ??
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80',
    category: entry.recipeSnapshot?.category ?? 'Recipe',
    tags: [],
    sourceType: 'internal',
    cookingTime: 'Saved',
    notes: '',
    ingredients: [],
    steps: [],
    ownerId: null,
    visibility: 'private',
  }))

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Cookbook Folder"
          title={collection.name}
          description={
            collection.description ||
            'Use this folder to keep one recipe theme organized in your cookbook.'
          }
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="card-base p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Folder Summary
                  </p>
                  <p className="mt-3 text-sm leading-6 text-text-muted">
                    {collection.recipeCount} recipes currently stored in this folder.
                  </p>
                </div>
                <Button as={Link} to="/cookbook" variant="ghost">
                  Back to Cookbook
                </Button>
              </div>
            </div>

            {folderRecipes.length > 0 ? (
              <section className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Recipes in this folder</h2>
                  <p className="text-sm leading-6 text-text-muted">
                    Open a recipe to view its details, or remove it from this folder directly here.
                  </p>
                </div>
                <RecipeGrid recipes={folderRecipes} />
                <div className="space-y-3">
                  {collection.recipes.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-muted/50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-primary-dark">
                          {entry.recipeSnapshot?.title ?? 'Saved recipe'}
                        </p>
                        <p className="text-sm text-text-muted">
                          {entry.recipeSnapshot?.category ?? 'Recipe'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={toggleCollectionRecipe.isPending}
                        onClick={() =>
                          toggleCollectionRecipe.mutate({
                            collectionId: collection.id,
                            isMember: true,
                            recipeOverride: { id: entry.recipeId },
                          })
                        }
                      >
                        {toggleCollectionRecipe.isPending ? 'Removing…' : 'Remove from folder'}
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <div className="card-base p-6">
                <h2 className="text-2xl font-semibold">This folder is empty</h2>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  Add recipes from any recipe card or recipe detail page using the Add to Cookbook action.
                </p>
              </div>
            )}
          </div>

          <CollectionFormCard
            collection={collection}
            title="Rename folder"
            submitLabel="Save folder"
          />
        </div>
      </div>
    </PageSection>
  )
}
