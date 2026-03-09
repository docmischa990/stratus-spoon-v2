import { cn } from '@/utils/cn'

export function PageSection({ className, children }) {
  return <section className={cn('py-8 md:py-12', className)}>{children}</section>
}
