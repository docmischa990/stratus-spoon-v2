import { Button } from '@/components/ui/Button'
import { useDeleteCollection, useToggleCollectionRecipe } from '@/hooks/useCookbook'

export function CollectionCard({ collection }) {
  const deleteCollection = useDeleteCollection()
  const toggleCollectionRecipe = useToggleCollectionRecipe(null)

  return (
    <article className="card-base p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Collection</p>
          <h3 className="mt-3 text-xl font-semibold">{collection.name}</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {collection.description || 'A private collection ready for saved recipes.'}
          </p>
          <p className="mt-5 text-sm font-medium text-accent-dark">{collection.recipeCount} recipes</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          disabled={deleteCollection.isPending}
          onClick={() => deleteCollection.mutate(collection.id)}
        >
          {deleteCollection.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
      {collection.recipes?.length ? (
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Recently added</p>
          <div className="space-y-2">
            {collection.recipes.slice(0, 3).map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-surface-muted/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-primary-dark">
                    {recipe.recipeSnapshot?.title || 'Saved recipe'}
                  </p>
                  <p className="text-xs text-text-muted">{recipe.recipeSnapshot?.category || 'Recipe'}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-2 text-xs"
                  disabled={toggleCollectionRecipe.isPending}
                  onClick={() =>
                    toggleCollectionRecipe.mutate({
                      collectionId: collection.id,
                      isMember: true,
                      recipeOverride: {
                        id: recipe.recipeId,
                      },
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}
