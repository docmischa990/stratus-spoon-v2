'use client'

import Link from 'next/link'
import { usePathname, useRouter, useParams as useNextParams } from 'next/navigation'
import { forwardRef, useEffect } from 'react'

function normalizeTarget(target) {
  return target || '/'
}

function isRouteActive(pathname, href) {
  if (!pathname || !href) {
    return false
  }

  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export const RouterLink = forwardRef(function RouterLink({ to, href, ...props }, ref) {
  return <Link ref={ref} href={normalizeTarget(href || to)} {...props} />
})

export const NavLink = forwardRef(function NavLink({ to, href, className, ...props }, ref) {
  const pathname = usePathname()
  const resolvedHref = normalizeTarget(href || to)
  const isActive = isRouteActive(pathname, resolvedHref)

  return (
    <Link
      ref={ref}
      href={resolvedHref}
      className={typeof className === 'function' ? className({ isActive }) : className}
      {...props}
    />
  )
})

export function Navigate({ to, replace = false }) {
  const router = useRouter()

  useEffect(() => {
    if (replace) {
      router.replace(to)
      return
    }

    router.push(to)
  }, [replace, router, to])

  return null
}

export function useNavigate() {
  const router = useRouter()

  return (to, options = {}) => {
    if (options.replace) {
      router.replace(to)
      return
    }

    router.push(to)
  }
}

export function useLocation() {
  const pathname = usePathname()
  const search = typeof window === 'undefined' ? '' : window.location.search

  return {
    pathname,
    search,
    hash: '',
    state: null,
  }
}

export function useParams() {
  return useNextParams()
}

export { RouterLink as Link }
