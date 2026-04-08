import { PageSection } from '@/components/ui/PageSection'
import { FollowButton } from '@/components/social/FollowButton'
import { usePublicProfile } from '@/hooks/useSocial'
import { useRecipesByOwner } from '@/hooks/useRecipes'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'

export function PublicProfilePage({ uid }) {
  const { data: profile, isLoading, isError } = usePublicProfile(uid)
  const { data: recipes = [], isLoading: recipesLoading } = useRecipesByOwner(uid)

  if (isLoading) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <p className="text-sm text-text-muted">Loading profile…</p>
        </div>
      </PageSection>
    )
  }

  if (isError || !profile) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <p className="text-sm text-red-500">Profile not found.</p>
        </div>
      </PageSection>
    )
  }

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-10">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold">{profile.displayName}</h1>
            {profile.username && (
              <p className="text-sm text-text-muted">@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="max-w-xl text-sm leading-relaxed text-text-muted">{profile.bio}</p>
            )}
            <div className="flex gap-6 text-sm text-text-muted">
              <span><strong className="text-foreground">{profile.followerCount}</strong> followers</span>
              <span><strong className="text-foreground">{profile.followingCount}</strong> following</span>
              <span><strong className="text-foreground">{profile.recipeCount}</strong> recipes</span>
            </div>
          </div>
          <FollowButton targetUid={uid} />
        </div>

        <div className="space-y-4">
          <h2 className="font-heading font-semibold">Recipes</h2>
          {recipesLoading ? (
            <p className="text-sm text-text-muted">Loading recipes…</p>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-text-muted">No public recipes yet.</p>
          ) : (
            <RecipeGrid recipes={recipes} />
          )}
        </div>
      </div>
    </PageSection>
  )
}
