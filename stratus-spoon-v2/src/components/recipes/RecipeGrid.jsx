import { RecipeCard } from '@/components/recipes/RecipeCard'

export function RecipeGrid({ recipes }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
