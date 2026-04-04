import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { fadeUpVariant, pageTransition } from '@/utils/motion'

const MotionSection = motion.section

export function PageSection({ className, children }) {
  return (
    <MotionSection
      className={cn('py-8 md:py-12', className)}
      variants={fadeUpVariant}
      initial="initial"
      animate="animate"
      transition={pageTransition}
    >
      {children}
    </MotionSection>
  )
}
