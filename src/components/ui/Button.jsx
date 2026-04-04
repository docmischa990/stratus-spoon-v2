import { createElement } from 'react'
import { cn } from '@/utils/cn'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

export function Button({
  as = 'button',
  className,
  variant = 'primary',
  ...props
}) {
  const elementProps = { ...props }

  if (elementProps.to && !elementProps.href) {
    elementProps.href = elementProps.to
    delete elementProps.to
  }

  return createElement(as, {
    className: cn(variants[variant], className),
    ...elementProps,
  })
}
