import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useCreateCollection, useUpdateCollection } from '@/hooks/useCookbook'
import { fadeUpVariant, pageTransition } from '@/utils/motion'

const MotionSection = motion.section

export function CollectionFormCard({ collection = null, submitLabel, title, onSuccess }) {
  const createCollection = useCreateCollection()
  const updateCollection = useUpdateCollection()
  const [name, setName] = useState(collection?.name ?? '')
  const [description, setDescription] = useState(collection?.description ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const isEditing = Boolean(collection)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setErrorMessage('Add a folder name.')
      return
    }

    setErrorMessage('')

    try {
      if (isEditing) {
        await updateCollection.mutateAsync({
          collectionId: collection.id,
          name,
          description,
        })
      } else {
        await createCollection.mutateAsync({ name, description })
        setName('')
        setDescription('')
      }

      onSuccess?.()
    } catch (error) {
      setErrorMessage(error.message || `Unable to ${isEditing ? 'update' : 'create'} the folder.`)
    }
  }

  return (
    <MotionSection
      className="card-base p-5"
      variants={fadeUpVariant}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      transition={pageTransition}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {title || (isEditing ? 'Edit folder' : 'New folder')}
      </p>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Folder name</span>
          <input
            className="input-base"
            placeholder="Healthy Weeknights"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Description</span>
          <textarea
            className="input-base min-h-24"
            placeholder="Recipes for easy lighter dinners."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        {errorMessage ? <p className="text-sm font-medium text-danger">{errorMessage}</p> : null}
        <Button
          type="submit"
          disabled={createCollection.isPending || updateCollection.isPending}
          className="w-full"
        >
          {createCollection.isPending || updateCollection.isPending
            ? isEditing
              ? 'Saving…'
              : 'Creating…'
            : submitLabel || (isEditing ? 'Save changes' : 'Create folder')}
        </Button>
      </form>
    </MotionSection>
  )
}
