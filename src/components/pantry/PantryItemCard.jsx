import { useState } from 'react'
import { Button } from '@/components/ui/Button'

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

export function PantryItemCard({ item, onDelete, onUpdate, isDeleting }) {
  const [editing, setEditing] = useState(false)
  const [qty, setQty] = useState(item.quantity || '')
  const [unit, setUnit] = useState(item.unit || 'units')
  const [category, setCategory] = useState(item.category || 'Other')

  function handleSave() {
    onUpdate({ id: item.id, updates: { quantity: qty, unit, category } })
    setEditing(false)
  }

  function handleCancel() {
    setQty(item.quantity || '')
    setUnit(item.unit || 'units')
    setCategory(item.category || 'Other')
    setEditing(false)
  }

  const displayQty = [item.quantity, item.unit && item.unit !== 'units' ? item.unit : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-2 text-sm">
      {editing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize flex-1">{item.name}</span>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="input w-20 py-0.5 text-xs"
              placeholder="Qty"
              min="0"
              step="any"
              autoFocus
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input w-24 py-0.5 text-xs"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input py-0.5 text-xs flex-1"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Button size="xs" onClick={handleSave}>Save</Button>
            <Button size="xs" variant="ghost" onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium capitalize">{item.name}</span>
          <div className="flex items-center gap-2 ml-auto">
            {displayQty && (
              <span className="text-text-muted">{displayQty}</span>
            )}
            <Button size="xs" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600"
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
