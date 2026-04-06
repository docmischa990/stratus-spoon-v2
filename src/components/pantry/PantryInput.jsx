import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function PantryInput({ onAdd, isAdding }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), quantity: quantity.trim(), unit: '' })
    setName('')
    setQuantity('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ingredient (e.g. chicken breast)"
        className="input flex-1"
        disabled={isAdding}
        required
      />
      <input
        type="text"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Qty (e.g. 2)"
        className="input w-24"
        disabled={isAdding}
      />
      <Button type="submit" disabled={isAdding || !name.trim()}>
        {isAdding ? 'Adding…' : 'Add'}
      </Button>
    </form>
  )
}
