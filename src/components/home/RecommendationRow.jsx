import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FeaturedRecommendationCard } from '@/components/home/FeaturedRecommendationCard'
import { Button } from '@/components/ui/Button'

const MotionDiv = motion.div

export function RecommendationRow({ recipes }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const hasMultipleRecipes = recipes.length > 1

  if (!recipes.length) {
    return null
  }

  const safeActiveIndex = Math.min(activeIndex, recipes.length - 1)
  const activeRecipe = recipes[safeActiveIndex]

  const paginate = (nextDirection) => {
    if (!hasMultipleRecipes) {
      return
    }

    setDirection(nextDirection)
    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + nextDirection

      if (nextIndex < 0) {
        return recipes.length - 1
      }

      if (nextIndex >= recipes.length) {
        return 0
      }

      return nextIndex
    })
  }

  const motionVariants = {
    enter: (entryDirection) => ({
      opacity: 0,
      x: entryDirection > 0 ? 80 : -80,
      scale: 0.98,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (entryDirection) => ({
      opacity: 0,
      x: entryDirection > 0 ? -80 : 80,
      scale: 0.98,
    }),
  }

  return (
    <div className="relative px-0 md:px-12">
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between md:flex">
        <Button
          type="button"
          variant="secondary"
          className="pointer-events-auto h-14 w-14 rounded-full px-0 text-lg shadow-lg"
          onClick={() => paginate(-1)}
          disabled={!hasMultipleRecipes}
          aria-label="Show previous recipes"
        >
          ←
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="pointer-events-auto h-14 w-14 rounded-full px-0 text-lg shadow-lg"
          onClick={() => paginate(1)}
          disabled={!hasMultipleRecipes}
          aria-label="Show next recipes"
        >
          →
        </Button>
      </div>
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <MotionDiv
            key={activeRecipe.id}
            custom={direction}
            variants={motionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <FeaturedRecommendationCard
              recipe={activeRecipe}
              index={safeActiveIndex}
              total={recipes.length}
            />
          </MotionDiv>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3 md:hidden">
        <Button
          type="button"
          variant="secondary"
          className="px-4 py-2"
          onClick={() => paginate(-1)}
          disabled={!hasMultipleRecipes}
          aria-label="Show previous recipes"
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-4 py-2"
          onClick={() => paginate(1)}
          disabled={!hasMultipleRecipes}
          aria-label="Show next recipes"
        >
          Next
        </Button>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {recipes.map((recipe, index) => (
          <button
            key={recipe.id}
            type="button"
            className={`h-2.5 rounded-full transition-all ${
              index === safeActiveIndex ? 'w-8 bg-primary' : 'w-2.5 bg-primary/25'
            }`}
            onClick={() => {
              setDirection(index > safeActiveIndex ? 1 : -1)
              setActiveIndex(index)
            }}
            aria-label={`Show recipe ${index + 1}`}
            aria-pressed={index === safeActiveIndex}
          />
        ))}
      </div>
    </div>
  )
}
