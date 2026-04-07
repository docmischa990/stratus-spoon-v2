import { useUIStore } from '@/store/uiStore'

// Category values must match Spoonacular's `type` param exactly (lowercase)
// Label is display text, value is sent to the API
const filterOptions = {
  category: [
    { label: 'All', value: 'All' },
    { label: 'Main Course', value: 'main course' },
    { label: 'Side Dish', value: 'side dish' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Appetizer', value: 'appetizer' },
    { label: 'Salad', value: 'salad' },
    { label: 'Bread', value: 'bread' },
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Soup', value: 'soup' },
    { label: 'Beverage', value: 'beverage' },
    { label: 'Sauce', value: 'sauce' },
    { label: 'Marinade', value: 'marinade' },
    { label: 'Fingerfood', value: 'fingerfood' },
    { label: 'Snack', value: 'snack' },
    { label: 'Drink', value: 'drink' },
  ],
  cuisine: [
    'Any',
    'African',
    'American',
    'British',
    'Cajun',
    'Caribbean',
    'Chinese',
    'Eastern European',
    'European',
    'French',
    'German',
    'Greek',
    'Indian',
    'Irish',
    'Italian',
    'Japanese',
    'Jewish',
    'Korean',
    'Latin American',
    'Mediterranean',
    'Mexican',
    'Middle Eastern',
    'Nordic',
    'Southern',
    'Spanish',
    'Thai',
    'Vietnamese',
  ],
  diet: [
    'Any',
    'Gluten Free',
    'Ketogenic',
    'Vegetarian',
    'Lacto-Vegetarian',
    'Ovo-Vegetarian',
    'Vegan',
    'Pescetarian',
    'Paleo',
    'Primal',
    'Low FODMAP',
    'Whole30',
  ],
  // Tags are matched client-side against Spoonacular's dishTypes + diets + cuisines arrays
  // Only include values that Spoonacular actually returns
  tag: [
    'Any',
    'vegetarian',
    'vegan',
    'gluten free',
    'ketogenic',
    'pescatarian',
    'paleo',
    'primal',
    'whole30',
    'dairy free',
    'appetizer',
    'salad',
    'soup',
    'breakfast',
    'snack',
    'fingerfood',
    'dessert',
    'side dish',
    'main course',
    'beverage',
    'sauce',
  ],
  source: ['All', 'internal', 'api'],
  maxReadyTime: [
    { label: 'Any', value: 'Any' },
    { label: '15 min', value: '15' },
    { label: '30 min', value: '30' },
    { label: '45 min', value: '45' },
    { label: '60+ min', value: '60' },
  ],
  sort: ['popularity', 'healthiness', 'time', 'random'],
}

export function FilterPanel() {
  const filters = useUIStore((state) => state.filters)
  const setFilter = useUIStore((state) => state.setFilter)
  const resetRecipeFilters = useUIStore((state) => state.resetRecipeFilters)

  return (
    <aside className="card-base grid gap-4 p-5 md:grid-cols-3 lg:grid-cols-1">
      {Object.entries(filterOptions).map(([name, options]) => (
        <label key={name} className="space-y-2">
          <span className="text-sm font-semibold capitalize text-primary-dark">
            {name === 'maxReadyTime' ? 'Max Ready Time' : name}
          </span>
          <select
            className="input-base"
            value={filters[name]}
            onChange={(event) => setFilter(name, event.target.value)}
          >
            {options.map((option) => {
              const value = typeof option === 'object' ? option.value : option
              const label = typeof option === 'object' ? option.label : option
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            })}
          </select>
        </label>
      ))}
      <button
        type="button"
        className="text-sm font-semibold text-accent-dark"
        onClick={resetRecipeFilters}
      >
        Reset filters
      </button>
    </aside>
  )
}
