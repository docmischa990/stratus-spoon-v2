import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function PantryItemCard({ item, onDelete, onUpdate, isDeleting }) {
  const [editing, setEditing] = useState(false)
  const [qty, setQty] = useState(item.quantity || '')

  function handleSave() {
    onUpdate({ id: item.id, updates: { quantity: qty } })
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
      <span className="font-medium capitalize">{item.name}</span>
      <div className="flex items-center gap-2 ml-auto">
        {editing ? (
          <>
            <input
              type="text"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="input w-16 py-0.5 text-xs"
              autoFocus
            />
            <Button size="xs" onClick={handleSave}>Save</Button>
            <Button size="xs" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            {item.quantity && (
              <span className="text-text-muted">{item.quantity}</span>
            )}
            <Button size="xs" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
          </>
        )}
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
  )
}
