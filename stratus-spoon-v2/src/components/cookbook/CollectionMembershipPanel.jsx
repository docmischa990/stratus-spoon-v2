import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useCookbook, useToggleCollectionRecipe } from '@/hooks/useCookbook'

export function CollectionMembershipPanel({ recipe }) {
  const { isAuthenticated } = useAuth()
  const { data: cookbook } = useCookbook()
  const toggleCollectionRecipe = useToggleCollectionRecipe(recipe)

  if (!isAuthenticated) {
    return (
      <div className="card-base p-5">
        <p className="text-sm text-text-muted">Log in to add this recipe to one of your collections.</p>
      </div>
    )
  }

  const collections = cookbook?.collections ?? []

  if (collections.length === 0) {
    return (
      <div className="card-base p-5">
        <p className="text-sm text-text-muted">Create a collection in your cookbook first, then add this recipe to it.</p>
      </div>
    )
  }

  return (
    <div className="card-base space-y-4 p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Add to collection</h3>
        <p className="text-sm text-text-muted">Choose where this recipe should live in your private cookbook.</p>
      </div>
      <div className="space-y-3">
        {collections.map((collection) => {
          const isMember = collection.recipes?.some((entry) => entry.recipeId === recipe.id)

          return (
            <div
              key={collection.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-muted/50 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-primary-dark">{collection.name}</p>
                <p className="text-sm text-text-muted">
                  {collection.recipeCount} recipes
                  {collection.description ? ` • ${collection.description}` : ''}
                </p>
              </div>
              <Button
                type="button"
                variant={isMember ? 'ghost' : 'secondary'}
                disabled={toggleCollectionRecipe.isPending}
                onClick={() => toggleCollectionRecipe.mutate({ collectionId: collection.id, isMember })}
              >
                {toggleCollectionRecipe.isPending ? 'Saving…' : isMember ? 'Remove' : 'Add'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
