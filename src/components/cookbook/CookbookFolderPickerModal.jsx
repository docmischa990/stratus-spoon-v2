import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useCookbook, useToggleCollectionRecipe } from '@/hooks/useCookbook'

const MotionDiv = motion.div

export function CookbookFolderPickerModal({ isOpen, onClose, recipe }) {
  const { isAuthenticated } = useAuth()
  const { data: cookbook } = useCookbook()
  const toggleCollectionRecipe = useToggleCollectionRecipe(recipe)

  const collections = cookbook?.collections ?? []

  return (
    <AnimatePresence>
      {isOpen ? (
        <MotionDiv
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/45 px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MotionDiv
            className="card-base max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Add to Cookbook</p>
                <h2 className="text-2xl font-semibold">Choose folders for this recipe</h2>
                <p className="text-sm leading-6 text-text-muted">
                  Pick one or more folders for <span className="font-semibold text-primary-dark">{recipe.title}</span>.
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>

            {!isAuthenticated ? (
              <div className="mt-6 rounded-2xl border border-border bg-surface-muted/50 p-4">
                <p className="text-sm text-text-muted">Log in to organize recipes into cookbook folders.</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-border bg-surface-muted/50 p-4">
                <p className="text-sm text-text-muted">
                  You do not have any folders yet. Create a folder first, then add this recipe to it.
                </p>
                <Button as={Link} to="/cookbook" variant="secondary" onClick={onClose}>
                  Open Cookbook
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {collections.map((collection) => {
                  const isMember = collection.recipes?.some((entry) => entry.recipeId === recipe.id)

                  return (
                    <div
                      key={collection.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-muted/50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-primary-dark">{collection.name}</p>
                          <span className="rounded-full bg-background px-3 py-1 text-xs text-text-muted">
                            {collection.recipeCount} recipes
                          </span>
                        </div>
                        <p className="text-sm text-text-muted">
                          {collection.description || 'Private cookbook folder for your chosen recipe theme.'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={isMember ? 'ghost' : 'secondary'}
                        disabled={toggleCollectionRecipe.isPending}
                        onClick={() => toggleCollectionRecipe.mutate({ collectionId: collection.id, isMember })}
                      >
                        {toggleCollectionRecipe.isPending ? 'Saving…' : isMember ? 'Remove from folder' : 'Add to folder'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )
}
