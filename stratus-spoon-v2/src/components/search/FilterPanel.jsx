import { useUIStore } from '@/store/uiStore'

const filterOptions = {
  category: ['All', 'Dinner', 'Pasta', 'Brunch'],
  tag: ['Any', 'Seasonal', 'Vegetarian', 'Quick'],
  source: ['All', 'internal', 'external'],
}

export function FilterPanel() {
  const filters = useUIStore((state) => state.filters)
  const setFilter = useUIStore((state) => state.setFilter)

  return (
    <aside className="card-base grid gap-4 p-5 md:grid-cols-3 lg:grid-cols-1">
      {Object.entries(filterOptions).map(([name, options]) => (
        <label key={name} className="space-y-2">
          <span className="text-sm font-semibold capitalize text-primary-dark">{name}</span>
          <select
            className="input-base"
            value={filters[name]}
            onChange={(event) => setFilter(name, event.target.value)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}
    </aside>
  )
}
