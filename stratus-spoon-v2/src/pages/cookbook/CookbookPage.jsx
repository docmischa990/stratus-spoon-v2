import { CookbookHighlights } from '@/components/cookbook/CookbookHighlights'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCookbook } from '@/hooks/useCookbook'

export function CookbookPage() {
  const { data: cookbook, isLoading, isError } = useCookbook()

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Cookbook"
          title="Favorites, created recipes, and collections"
          description="This dashboard now reads your cookbook state from Firestore and lets you persist favorite recipes and collection folders."
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
          <CookbookHighlights cookbook={cookbook} />
        ) : null}
      </div>
    </PageSection>
  )
}
