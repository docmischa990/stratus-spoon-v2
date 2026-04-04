import { Link } from '@/lib/router'
import { RecommendationSection } from '@/components/home/RecommendationSection'
import { Button } from '@/components/ui/Button'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useRecommendations } from '@/hooks/useRecommendations'

export function HomePage() {
  const { recommended, trending, quickMeals, healthy, isLoading, isError, error } = useRecommendations()

  return (
    <>
      <PageSection className="pb-10 pt-10 md:pt-16">
        <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-dark">
              Warm recipe platform
            </span>
            <div className="space-y-5">
              <h1 className="max-w-2xl text-5xl font-semibold leading-tight md:text-6xl">
                A modern kitchen for discovering, saving, and creating recipes.
              </h1>
              <p className="max-w-prose text-lg leading-8 text-text-muted">
                This foundation pass replaces the starter app with a scalable React architecture, Tailwind
                design system, and future-ready service layer for Firebase and AI workflows.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to="/recipes">
                Browse recipes
              </Button>
              <Button as={Link} to="/create" variant="secondary">
                Create a recipe
              </Button>
            </div>
          </div>
          <div className="card-base overflow-hidden p-4">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80"
              alt="Seasonal ingredients on a kitchen table"
              className="aspect-[4/3] w-full rounded-[1.25rem] object-cover"
            />
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="container space-y-8">
          <SectionHeading
            eyebrow="Personalized discovery"
            title="Recommendation rails tuned to the recipes you save and browse"
            description="Phase 1 keeps recommendations inside the existing Firestore recipe catalog so the home page can surface useful categories without adding backend complexity."
          />
          <RecommendationSection
            title="Recommended For You"
            description="Personalized from your saved recipe tags and categories, with recent recipes as the fallback."
            recipes={recommended}
            emptyMessage="Save a few favorites or add more public recipes to unlock personalized suggestions."
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
          />
          <RecommendationSection
            title="Trending Recipes"
            description="Fresh additions from the current recipe catalog."
            recipes={trending}
            emptyMessage="Trending recipes will appear here as new public recipes are added."
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
          />
          <RecommendationSection
            title="Quick Meals"
            description="Fast recipes tagged for quick cooking or short prep windows."
            recipes={quickMeals}
            emptyMessage="No quick meals match the current recipe catalog yet."
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
          />
          <RecommendationSection
            title="Healthy Recipes"
            description="Balanced recipes prioritized around healthy and dietary-friendly tags."
            recipes={healthy}
            emptyMessage="Healthy recipes will appear here once the catalog includes more matching tags."
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
          />
        </div>
      </PageSection>
    </>
  )
}
