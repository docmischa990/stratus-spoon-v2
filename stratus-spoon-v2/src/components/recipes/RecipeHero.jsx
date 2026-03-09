import { useState } from 'react'
import { CollectionMembershipPanel } from '@/components/cookbook/CollectionMembershipPanel'
import { Button } from '@/components/ui/Button'
import { FavoriteToggleButton } from '@/components/cookbook/FavoriteToggleButton'

export function RecipeHero({ recipe }) {
  const [isCollectionPanelOpen, setIsCollectionPanelOpen] = useState(false)

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 text-sm text-text-muted">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">{recipe.category}</span>
          {recipe.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-muted px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold md:text-5xl">{recipe.title}</h1>
          <p className="max-w-prose text-lg leading-8 text-text-muted">{recipe.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FavoriteToggleButton recipe={recipe} variant="primary" />
          <Button type="button" variant="secondary" onClick={() => setIsCollectionPanelOpen((value) => !value)}>
            {isCollectionPanelOpen ? 'Hide collections' : 'Add to collection'}
          </Button>
          <Button variant="ghost">Edit later</Button>
        </div>
        {isCollectionPanelOpen ? <CollectionMembershipPanel recipe={recipe} /> : null}
      </div>
      <div className="overflow-hidden rounded-3xl border border-border shadow-card">
        <img src={recipe.image} alt={recipe.title} className="aspect-[4/3] h-full w-full object-cover" />
      </div>
    </section>
  )
}
