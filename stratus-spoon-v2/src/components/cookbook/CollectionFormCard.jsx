import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useCreateCollection } from '@/hooks/useCookbook'

export function CollectionFormCard() {
  const createCollection = useCreateCollection()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setErrorMessage('Add a collection name.')
      return
    }

    setErrorMessage('')

    try {
      await createCollection.mutateAsync({ name, description })
      setName('')
      setDescription('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to create the collection.')
    }
  }

  return (
    <section className="card-base p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">New collection</p>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Name</span>
          <input className="input-base" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Description</span>
          <textarea
            className="input-base min-h-24"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        {errorMessage ? <p className="text-sm font-medium text-danger">{errorMessage}</p> : null}
        <Button type="submit" disabled={createCollection.isPending} className="w-full">
          {createCollection.isPending ? 'Creating…' : 'Create collection'}
        </Button>
      </form>
    </section>
  )
}
