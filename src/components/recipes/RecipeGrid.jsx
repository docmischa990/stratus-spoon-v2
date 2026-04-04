import { motion } from 'framer-motion'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { staggerContainerVariant } from '@/utils/motion'

const MotionDiv = motion.div

export function RecipeGrid({ recipes }) {
  return (
    <MotionDiv
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      variants={staggerContainerVariant}
      initial="initial"
      animate="animate"
    >
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </MotionDiv>
  )
}
