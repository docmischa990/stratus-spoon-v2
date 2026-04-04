import { Link } from '@/lib/router'
import { Button } from '@/components/ui/Button'
import { PageSection } from '@/components/ui/PageSection'

export function NotFoundPage() {
  return (
    <PageSection className="pt-10 md:pt-16">
      <div className="container">
        <div className="card-base flex flex-col items-start gap-4 p-8">
          <span className="rounded-full bg-accent/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent-dark">
            404
          </span>
          <h1 className="text-4xl font-semibold">That page isn’t on the menu.</h1>
          <p className="max-w-prose text-sm leading-7 text-text-muted">
            The route structure is in place, but this path does not map to a current page.
          </p>
          <Button as={Link} to="/">
            Back home
          </Button>
        </div>
      </div>
    </PageSection>
  )
}
