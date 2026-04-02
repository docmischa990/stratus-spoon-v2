import { RecommendationRow } from '@/components/home/RecommendationRow'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function RecommendationSection({
  title,
  description,
  recipes,
  emptyMessage,
  isLoading = false,
  isError = false,
  errorMessage,
}) {
  return (
    <section className="space-y-5">
      <SectionHeading title={title} description={description} />
      {isLoading ? (
        <div className="card-base p-6">
          <p className="text-sm text-text-muted">Loading recipes…</p>
        </div>
      ) : isError ? (
        <div className="card-base p-6">
          <p className="text-sm text-text-muted">{errorMessage || 'Recipes are unavailable right now.'}</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="card-base p-6">
          <p className="text-sm text-text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <RecommendationRow recipes={recipes} />
      )}
    </section>
  )
}
