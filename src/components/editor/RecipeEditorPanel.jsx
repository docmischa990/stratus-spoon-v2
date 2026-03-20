import { Button } from '@/components/ui/Button'

const categories = ['Dinner', 'Brunch', 'Dessert', 'Lunch', 'Breakfast', 'Snack']

export function RecipeEditorPanel({
  formValues,
  onChange,
  onSubmit,
  isSubmitting,
  errorMessage,
  submitLabel = 'Publish recipe',
  title = 'Recipe editor',
}) {
  return (
    <section className="card-base p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-primary-dark">Recipe title</span>
          <input
            className="input-base"
            placeholder="Roasted tomato galette"
            value={formValues.title}
            onChange={(event) => onChange('title', event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Category</span>
          <select
            className="input-base"
            value={formValues.category}
            onChange={(event) => onChange('category', event.target.value)}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Tags</span>
          <input
            className="input-base"
            placeholder="Summer, Baking"
            value={formValues.tags}
            onChange={(event) => onChange('tags', event.target.value)}
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-primary-dark">Description</span>
          <textarea
            className="input-base min-h-28"
            placeholder="Describe the recipe in a few inviting lines."
            value={formValues.description}
            onChange={(event) => onChange('description', event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Ingredients</span>
          <textarea
            className="input-base min-h-40"
            placeholder="List one ingredient per line."
            value={formValues.ingredients}
            onChange={(event) => onChange('ingredients', event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Method</span>
          <textarea
            className="input-base min-h-40"
            placeholder="Capture each step in order."
            value={formValues.steps}
            onChange={(event) => onChange('steps', event.target.value)}
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-primary-dark">Notes</span>
          <textarea
            className="input-base min-h-24"
            placeholder="Helpful serving, storage, or substitution notes."
            value={formValues.notes}
            onChange={(event) => onChange('notes', event.target.value)}
          />
        </label>
        {errorMessage ? <p className="md:col-span-2 text-sm font-medium text-danger">{errorMessage}</p> : null}
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving recipe…' : submitLabel}
          </Button>
        </div>
      </form>
    </section>
  )
}
