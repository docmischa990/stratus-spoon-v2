import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { categoriseIngredient } from '@/services/pantry/pantryService'

const UNITS = ['units', 'g', 'kg', 'ml', 'L', 'tbsp', 'tsp', 'cup']

const CATEGORIES = [
  'Meat & Seafood',
  'Dairy',
  'Vegetables',
  'Fruits',
  'Grains & Pasta',
  'Spices & Condiments',
  'Canned & Pantry',
  'Other',
]

export function PantryInput({ onAdd, isAdding }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('units')
  const [categoryOverride, setCategoryOverride] = useState(null)

  const detectedCategory = useMemo(
    () => (name.trim() ? categoriseIngredient(name) : null),
    [name]
  )

  const activeCategory = categoryOverride ?? detectedCategory

  function handleNameChange(e) {
    setName(e.target.value)
    // Reset override whenever the name changes so detection stays fresh
    setCategoryOverride(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      quantity: quantity.trim(),
      unit,
      category: activeCategory ?? 'Other',
    })
    setName('')
    setQuantity('')
    setUnit('units')
    setCategoryOverride(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Ingredient (e.g. chicken breast)"
          className="input flex-1"
          disabled={isAdding}
          required
        />
        {/* Quantity */}
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          className="input w-20"
          disabled={isAdding}
          min="0"
          step="any"
        />
        {/* Unit */}
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="input w-24"
          disabled={isAdding}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <Button type="submit" disabled={isAdding || !name.trim()}>
          {isAdding ? 'Adding…' : 'Add'}
        </Button>
      </div>

      {/* Category preview + override */}
      {detectedCategory && (
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>
            Category: <span className="font-medium text-foreground">{activeCategory}</span>
            {categoryOverride && (
              <button
                type="button"
                onClick={() => setCategoryOverride(null)}
                className="ml-1.5 text-text-muted underline hover:text-foreground"
              >
                (reset)
              </button>
            )}
          </span>
          <select
            value={activeCategory}
            onChange={(e) => setCategoryOverride(e.target.value)}
            className="input py-0.5 text-xs"
            disabled={isAdding}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}
    </form>
  )
}
