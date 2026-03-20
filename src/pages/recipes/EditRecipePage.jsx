import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AIImageGeneratorCard } from '@/components/editor/AIImageGeneratorCard'
import { ImageUploadCard } from '@/components/editor/ImageUploadCard'
import { RecipeEditorPanel } from '@/components/editor/RecipeEditorPanel'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useAuth } from '@/context/useAuth'
import { useImagePresets } from '@/hooks/useImagePresets'
import { useRecipe, useUpdateRecipeMutation } from '@/hooks/useRecipes'
import { getRecipeFormDefaults } from '@/services/recipes/recipeService'

export function EditRecipePage() {
  const { recipeId } = useParams()
  const { user } = useAuth()
  const { data: recipe, isLoading } = useRecipe(recipeId)

  if (isLoading) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading recipe editor…</p>
          </div>
        </div>
      </PageSection>
    )
  }

  if (!recipe || recipe.ownerId !== user?.uid) {
    return (
      <PageSection className="pt-10 md:pt-14">
        <div className="container">
          <div className="card-base p-6">
            <h1 className="text-3xl font-semibold">Edit unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Only the recipe owner can edit this recipe.
            </p>
          </div>
        </div>
      </PageSection>
    )
  }

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Edit"
          title="Update your recipe"
          description="This editor reuses the same Firestore-backed form flow as recipe creation."
        />
        <EditRecipeForm key={recipe.id} recipe={recipe} />
      </div>
    </PageSection>
  )
}

function EditRecipeForm({ recipe }) {
  const navigate = useNavigate()
  const { data: presets = [] } = useImagePresets()
  const updateRecipe = useUpdateRecipeMutation()
  const [formValues, setFormValues] = useState(() => getRecipeFormDefaults(recipe))
  const [imageFile, setImageFile] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(recipe.image || '')
  const [errorMessage, setErrorMessage] = useState('')

  function updateField(name, value) {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSelectImage(nextFile) {
    setImageFile(nextFile)
    setGeneratedImage(null)

    if (!nextFile) {
      setImagePreviewUrl(recipe.image || '')
      return
    }

    setImagePreviewUrl(URL.createObjectURL(nextFile))
  }

  function handleUseGeneratedImage(nextGeneratedImage) {
    setGeneratedImage(nextGeneratedImage)
    setImageFile(null)
    setImagePreviewUrl(nextGeneratedImage?.url ?? recipe.image ?? '')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      await updateRecipe.mutateAsync({
        recipeId: recipe.id,
        formValues,
        imageFile,
        generatedImage,
      })
      navigate(`/recipes/${recipe.id}`)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update the recipe.')
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <RecipeEditorPanel
        formValues={formValues}
        onChange={updateField}
        onSubmit={handleSubmit}
        isSubmitting={updateRecipe.isPending}
        errorMessage={errorMessage}
        submitLabel="Save changes"
        title="Edit recipe"
      />
      <div className="space-y-6">
        <ImageUploadCard
          imageFile={imageFile}
          imagePreviewUrl={imagePreviewUrl}
          onSelectImage={handleSelectImage}
        />
        <AIImageGeneratorCard
          presets={presets}
          title={formValues.title}
          description={formValues.description}
          recipeId={recipe.id}
          generatedImage={generatedImage}
          onUseGeneratedImage={handleUseGeneratedImage}
        />
      </div>
    </div>
  )
}
