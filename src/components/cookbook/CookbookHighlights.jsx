import { CollectionFormCard } from '@/components/cookbook/CollectionFormCard'
import { CollectionCard } from '@/components/cookbook/CollectionCard'
import { CookbookRecipeSection } from '@/components/cookbook/CookbookRecipeSection'
import { StatCard } from '@/components/ui/StatCard'

export function CookbookHighlights({ cookbook }) {
  return (
    <section className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Favorites" value={cookbook.favorites.length} />
        <StatCard label="Created recipes" value={cookbook.createdRecipes.length} />
        <StatCard label="Collections" value={cookbook.collections.length} />
      </div>

      <CookbookRecipeSection
        title="My recipes"
        description="Recipes you authored and saved to Firestore."
        recipes={cookbook.createdRecipes}
      />

      <CookbookRecipeSection
        title="Favorites"
        description="Recipes you’ve saved into your cookbook."
        recipes={cookbook.favorites}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Collections</h2>
            <p className="text-sm leading-6 text-text-muted">
              Private collection folders are now persisted in your Firestore user space.
            </p>
          </div>
          {cookbook.collections.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {cookbook.collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="card-base p-6">
              <p className="text-sm text-text-muted">No collections yet. Create one to start organizing saved recipes.</p>
            </div>
          )}
        </div>
        <CollectionFormCard />
      </div>
    </section>
  )
}
