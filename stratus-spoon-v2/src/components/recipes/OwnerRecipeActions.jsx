import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useDeleteRecipeMutation } from '@/hooks/useRecipes'

export function OwnerRecipeActions({ recipeId }) {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const deleteRecipe = useDeleteRecipeMutation()

  async function handleDelete() {
    setErrorMessage('')

    try {
      await deleteRecipe.mutateAsync(recipeId)
      navigate('/cookbook', { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete the recipe.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button as={Link} to={`/recipes/${recipeId}/edit`} variant="secondary">
          Edit recipe
        </Button>
        <Button type="button" variant="ghost" disabled={deleteRecipe.isPending} onClick={handleDelete}>
          {deleteRecipe.isPending ? 'Deleting…' : 'Delete recipe'}
        </Button>
      </div>
      {errorMessage ? <p className="text-sm font-medium text-danger">{errorMessage}</p> : null}
    </div>
  )
}
