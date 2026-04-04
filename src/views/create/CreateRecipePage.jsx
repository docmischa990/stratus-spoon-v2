import { useState } from 'react'
import { useNavigate } from '@/lib/router'
import { AIImageGeneratorCard } from '@/components/editor/AIImageGeneratorCard'
import { ImageUploadCard } from '@/components/editor/ImageUploadCard'
import { RecipeEditorPanel } from '@/components/editor/RecipeEditorPanel'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useImagePresets } from '@/hooks/useImagePresets'
import { useCreateRecipeMutation } from '@/hooks/useRecipes'
import { getRecipeFormDefaults } from '@/services/recipes/recipeService'

export function CreateRecipePage() {
  const { data: presets = [] } = useImagePresets()
  const createRecipe = useCreateRecipeMutation()
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState(getRecipeFormDefaults())
  const [imageFile, setImageFile] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
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
      setImagePreviewUrl('')
      return
    }

    setImagePreviewUrl(URL.createObjectURL(nextFile))
  }

  function handleUseGeneratedImage(nextGeneratedImage) {
    setGeneratedImage(nextGeneratedImage)
    setImageFile(null)
    setImagePreviewUrl(nextGeneratedImage?.url ?? '')
  }

  function validateForm() {
    if (!formValues.title.trim()) {
      return 'Add a recipe title.'
    }

    if (!formValues.description.trim()) {
      return 'Add a short recipe description.'
    }

    if (!formValues.ingredients.trim()) {
      return 'List at least one ingredient.'
    }

    if (!formValues.steps.trim()) {
      return 'Add at least one method step.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationMessage = validateForm()

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setErrorMessage('')

    try {
      const recipeId = await createRecipe.mutateAsync({
        formValues,
        imageFile,
        generatedImage,
      })

      setFormValues(getRecipeFormDefaults())
      setImageFile(null)
      setGeneratedImage(null)
      setImagePreviewUrl('')
      navigate(`/recipes/${recipeId}`)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save the recipe right now.')
    }
  }

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Create"
          title="A structured recipe editor with imagery workflows"
          description="This editor now saves internal recipes to Firestore and uploads optional cover imagery to Firebase Storage."
        />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <RecipeEditorPanel
            formValues={formValues}
            onChange={updateField}
            onSubmit={handleSubmit}
            isSubmitting={createRecipe.isPending}
            errorMessage={errorMessage}
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
              generatedImage={generatedImage}
              onUseGeneratedImage={handleUseGeneratedImage}
            />
          </div>
        </div>
      </div>
    </PageSection>
  )
}
