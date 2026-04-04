import { motion } from 'framer-motion'
import { fadeUpVariant, pageTransition } from '@/utils/motion'

const MotionDiv = motion.div

export function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <MotionDiv
      className={`flex max-w-2xl flex-col gap-3 ${alignment}`}
      variants={fadeUpVariant}
      initial="initial"
      animate="animate"
      transition={pageTransition}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </span>
      ) : null}
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
        {description ? <p className="text-base leading-7 text-text-muted">{description}</p> : null}
      </div>
    </MotionDiv>
  )
}
