import { useState } from 'react'
import { CollectionCard } from '@/components/cookbook/CollectionCard'
import { CollectionFormCard } from '@/components/cookbook/CollectionFormCard'
import { Button } from '@/components/ui/Button'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCookbook } from '@/hooks/useCookbook'

export function CookbookPage() {
  const { data: cookbook, isLoading, isError } = useCookbook()
  const [viewMode, setViewMode] = useState('grid')
  const [folderQuery, setFolderQuery] = useState('')

  const folderSuggestions = (cookbook?.collections ?? []).map((collection) => collection.name)
  const normalizedQuery = folderQuery.trim().toLowerCase()
  const filteredCollections = !cookbook?.collections
    ? []
    : !normalizedQuery
      ? cookbook.collections
      : cookbook.collections.filter((collection) => collection.name.toLowerCase().includes(normalizedQuery))

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Cookbook"
          title="Your recipe folders"
          description="Cookbook is your folder-based organization space for recipes grouped by theme, event, meal style, or whatever naming system works for you."
        />
        {isLoading ? (
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading your cookbook…</p>
          </div>
        ) : isError ? (
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold">Cookbook unavailable</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Check your Firebase configuration, authentication state, and Firestore indexes.
            </p>
          </div>
        ) : cookbook ? (
          <section className="space-y-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="space-y-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-primary-dark">Search folders</span>
                      <input
                        list="cookbook-folder-suggestions"
                        type="search"
                        className="input-base"
                        placeholder="Search by folder name"
                        value={folderQuery}
                        onChange={(event) => setFolderQuery(event.target.value)}
                      />
                    </label>
                    <datalist id="cookbook-folder-suggestions">
                      {folderSuggestions.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                    <p className="text-sm text-text-muted">
                      Search folders like “Healthy Recipes”, “Cheat Day”, or “Guests”.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                    >
                      Grid view
                    </Button>
                    <Button
                      type="button"
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      onClick={() => setViewMode('list')}
                    >
                      List view
                    </Button>
                  </div>
                </div>

                {filteredCollections.length > 0 ? (
                  <div className={viewMode === 'grid' ? 'grid gap-5 lg:grid-cols-2' : 'space-y-4'}>
                    {filteredCollections.map((collection) => (
                      <CollectionCard key={collection.id} collection={collection} viewMode={viewMode} />
                    ))}
                  </div>
                ) : (
                  <div className="card-base p-6">
                    <h2 className="text-2xl font-semibold">No folders match that search</h2>
                    <p className="mt-3 text-sm leading-6 text-text-muted">
                      Try a different folder name or create a new folder for the recipes you want to organize.
                    </p>
                  </div>
                )}
              </div>

              <CollectionFormCard />
            </div>
          </section>
        ) : null}
      </div>
    </PageSection>
  )
}
