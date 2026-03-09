export function IngredientList({ ingredients }) {
  return (
    <section className="card-base p-6">
      <h2 className="text-2xl font-semibold">Ingredients</h2>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-text-muted">
        {ingredients.map((ingredient) => (
          <li key={ingredient} className="flex items-start gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <span>{ingredient}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
