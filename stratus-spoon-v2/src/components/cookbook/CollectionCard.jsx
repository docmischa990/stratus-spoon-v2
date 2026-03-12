import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useDeleteCollection, useToggleCollectionRecipe } from '@/hooks/useCookbook'

export function CollectionCard({ collection, viewMode = 'grid' }) {
  const deleteCollection = useDeleteCollection()
  const toggleCollectionRecipe = useToggleCollectionRecipe(null)
  const isList = viewMode === 'list'

  return (
    <article className={`card-base p-5 ${isList ? 'flex flex-col gap-5 md:flex-row md:items-start md:justify-between' : ''}`}>
      <div className={`flex items-start justify-between gap-4 ${isList ? 'md:min-w-[320px]' : ''}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Cookbook folder</p>
          <h3 className="mt-3 text-xl font-semibold">{collection.name}</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {collection.description || 'A private folder ready for recipes you want grouped together.'}
          </p>
          <p className="mt-5 text-sm font-medium text-accent-dark">{collection.recipeCount} recipes</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button as={Link} to={`/cookbook/${collection.id}`} type="button" variant="secondary">
            View folder
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={deleteCollection.isPending}
            onClick={() => deleteCollection.mutate(collection.id)}
          >
            {deleteCollection.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
      {collection.recipes?.length ? (
        <div className={`${isList ? 'md:min-w-[320px] md:flex-1' : 'mt-5'} space-y-2 border-t border-border pt-4 ${isList ? 'md:mt-0 md:border-l md:border-t-0 md:pl-5 md:pt-0' : ''}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Recently added</p>
          <div className={`space-y-2 ${isList ? 'md:grid md:grid-cols-2 md:gap-2 md:space-y-0' : ''}`}>
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
      ) : (
        <div className={`${isList ? 'md:min-w-[320px] md:flex-1 md:border-l md:border-border md:pl-5' : 'mt-5 border-t border-border pt-4'}`}>
          <p className="text-sm text-text-muted">No recipes in this folder yet.</p>
        </div>
      )}
    </article>
  )
}
