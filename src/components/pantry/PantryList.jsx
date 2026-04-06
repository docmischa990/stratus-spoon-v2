import { PantryItemCard } from './PantryItemCard'

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
}

export function PantryList({ items, onDelete, onUpdate, deletingId }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Your pantry is empty. Add an ingredient above to get started.
      </p>
    )
  }

  const grouped = groupByCategory(items)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
            {category}
          </h3>
          <div className="space-y-1.5">
            {categoryItems.map((item) => (
              <PantryItemCard
                key={item.id}
                item={item}
                onDelete={onDelete}
                onUpdate={onUpdate}
                isDeleting={deletingId === item.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
