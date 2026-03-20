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
  return createElement(as, {
    className: cn(variants[variant], className),
    ...props,
  })
}
