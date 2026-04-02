export const pageTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
}

export const fadeUpVariant = {
  initial: {
    opacity: 0,
    y: 24,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
}

export const staggerContainerVariant = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}
