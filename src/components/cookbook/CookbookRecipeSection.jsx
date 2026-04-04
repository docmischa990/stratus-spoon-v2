import { Link } from '@/lib/router'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { RecipeGrid } from '@/components/recipes/RecipeGrid'

export function CookbookRecipeSection({ title, description, recipes }) {
  const { user } = useAuth()

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm leading-6 text-text-muted">{description}</p>
      </div>
      {recipes.length > 0 ? (
        <>
          <RecipeGrid recipes={recipes} />
          {title === 'My recipes' ? (
            <div className="flex flex-wrap gap-3">
              {recipes
                .filter((recipe) => recipe.ownerId === user?.uid)
                .slice(0, 6)
                .map((recipe) => (
                  <Button key={recipe.id} as={Link} to={`/recipes/${recipe.id}/edit`} variant="ghost">
                    Edit {recipe.title}
                  </Button>
                ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="card-base p-6">
          <p className="text-sm text-text-muted">Nothing here yet.</p>
        </div>
      )}
    </section>
  )
}
