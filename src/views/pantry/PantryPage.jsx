import { useState } from 'react'
import { PageSection } from '@/components/ui/PageSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { PantryInput } from '@/components/pantry/PantryInput'
import { PantryList } from '@/components/pantry/PantryList'
import { GeneratedRecipeCard } from '@/components/pantry/GeneratedRecipeCard'
import { usePantry, useAddIngredient, useUpdateIngredient, useDeleteIngredient } from '@/hooks/usePantry'
import { useGeneratePantryRecipes, useApplyRecipeToPantry } from '@/hooks/usePantryRecipes'

export function PantryPage() {
  const [generatedRecipes, setGeneratedRecipes] = useState([])
  const [applyingRecipeId, setApplyingRecipeId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const { data: pantryItems = [], isLoading, isError } = usePantry()
  const addMutation = useAddIngredient()
  const updateMutation = useUpdateIngredient()
  const deleteMutation = useDeleteIngredient()
  const generateMutation = useGeneratePantryRecipes()
  const applyMutation = useApplyRecipeToPantry()

  async function handleDelete(id) {
    setDeletingId(id)
    await deleteMutation.mutateAsync(id).finally(() => setDeletingId(null))
  }

  async function handleGenerate() {
    if (pantryItems.length === 0) return
    const names = pantryItems.map((i) => i.name)
    const recipes = await generateMutation.mutateAsync(names)
    setGeneratedRecipes(recipes)
  }

  async function handleUseRecipe(recipe) {
    setApplyingRecipeId(recipe.id)
    await applyMutation.mutateAsync({
      pantryItems,
      recipeIngredients: recipe.ingredients ?? [],
    }).finally(() => setApplyingRecipeId(null))
    setGeneratedRecipes([])
  }

  return (
    <PageSection className="pt-10 md:pt-14">
      <div className="container space-y-10">
        {/* Header */}
        <SectionHeading
          eyebrow="Smart Pantry"
          title="What can you cook today?"
          description="Add the ingredients you have on hand and we'll suggest recipes you can make right now."
        />

        {/* Input */}
        <div className="card-base p-6 space-y-4">
          <h2 className="font-heading font-semibold">Add ingredient</h2>
          <PantryInput
            onAdd={(data) => addMutation.mutate(data)}
            isAdding={addMutation.isPending}
          />
        </div>

        {/* Pantry List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold">
              Your pantry
              {pantryItems.length > 0 && (
                <span className="ml-2 text-sm font-normal text-text-muted">
                  ({pantryItems.length} item{pantryItems.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
            {pantryItems.length > 0 && (
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Finding recipes…' : 'Generate recipes'}
              </Button>
            )}
          </div>

          {isLoading ? (
            <p className="text-sm text-text-muted">Loading pantry…</p>
          ) : isError ? (
            <p className="text-sm text-red-500">Failed to load pantry. Please refresh.</p>
          ) : (
            <PantryList
              items={pantryItems}
              onDelete={handleDelete}
              onUpdate={({ id, updates }) => updateMutation.mutate({ id, updates })}
              deletingId={deletingId}
            />
          )}
        </div>

        {/* Generated Recipes */}
        {generateMutation.isError && (
          <p className="text-sm text-red-500">
            Recipe generation failed. Check your connection and try again.
          </p>
        )}

        {generatedRecipes.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-heading font-semibold">Recipes you can make</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {generatedRecipes.map((recipe) => (
                <GeneratedRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onUseRecipe={handleUseRecipe}
                  isApplying={applyingRecipeId === recipe.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageSection>
  )
}
