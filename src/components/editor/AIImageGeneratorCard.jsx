import { Button } from '@/components/ui/Button'
import { useGenerateRecipeImageMutation } from '@/hooks/useImagePresets'

export function AIImageGeneratorCard({
  presets = [],
  title,
  description,
  recipeId = 'draft',
  generatedImage,
  onUseGeneratedImage,
}) {
  const generateRecipeImage = useGenerateRecipeImageMutation()

  async function handleGenerate() {
    try {
      const payload = await generateRecipeImage.mutateAsync({
        title,
        description,
        recipeId,
      })

      onUseGeneratedImage(payload.image)
    } catch {
      // Mutation state already captures the error for inline rendering.
    }
  }

  return (
    <section className="card-base p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">AI image generation</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Generate a recipe image from the current title and optional description. The generated image
            becomes the active recipe image preview and will be saved with the recipe unless you replace it
            with a manual upload.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Live
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <span key={preset} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-text-muted">
            {preset}
          </span>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl bg-surface-muted/60 p-4 text-sm leading-6 text-text-muted">
          {title?.trim()
            ? `The image request will use "${title.trim()}" as the primary prompt and include the description only when it helps clarify the dish.`
            : 'Add a recipe title first. A title is required before an AI image can be generated.'}
        </div>
        {generatedImage?.url ? (
          <div className="space-y-3">
            <img
              src={generatedImage.url}
              alt="Generated recipe preview"
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
            <p className="text-sm leading-6 text-text-muted">
              This generated image is now selected and will be saved as the recipe image unless you replace it
              with a manual upload.
            </p>
          </div>
        ) : null}
        {generateRecipeImage.isSuccess && generatedImage?.url ? (
          <p className="text-sm font-medium text-emerald-700">
            Image generated successfully. Review the preview before saving the recipe.
          </p>
        ) : null}
        {generateRecipeImage.isError ? (
          <p className="text-sm font-medium text-danger">
            {generateRecipeImage.error?.message || 'AI image generation is temporarily unavailable.'}
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={generateRecipeImage.isPending || !title?.trim()}
          onClick={handleGenerate}
        >
          <span className="flex items-center justify-center gap-3">
            {generateRecipeImage.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating image…
              </>
            ) : (
              'Generate AI Image'
            )}
          </span>
        </Button>
      </div>
    </section>
  )
}
