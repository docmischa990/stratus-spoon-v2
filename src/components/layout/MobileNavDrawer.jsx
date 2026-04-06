import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink } from '@/lib/router'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const MotionDiv = motion.div
const MotionAside = motion.aside

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/pantry', label: 'Pantry' },
  { to: '/create', label: 'Create recipe' },
  { to: '/cookbook', label: 'Cookbook' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/my-recipes', label: 'My Recipes' },
]

export function MobileNavDrawer() {
  const isOpen = useUIStore((state) => state.isMobileNavOpen)
  const closeMobileNav = useUIStore((state) => state.closeMobileNav)
  const { isAuthenticated, isLoading, logoutUser, user } = useAuth()

  return (
    <AnimatePresence>
      {isOpen ? (
        <MotionDiv
          className={cn('fixed inset-0 z-40 bg-primary-dark/30 md:hidden')}
          onClick={closeMobileNav}
          aria-hidden={!isOpen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <MotionAside
            className="absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col gap-6 border-l border-border bg-surface px-6 py-6 shadow-card"
            onClick={(event) => event.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/" className="text-xl font-semibold text-primary-dark" onClick={closeMobileNav}>
              Stratus Spoon
            </Link>
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileNav}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-medium text-text-muted hover:bg-primary-dark/5 hover:text-primary-dark',
                      isActive && 'bg-primary-dark/5 text-primary-dark',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              {isLoading ? (
                <p className="text-sm text-text-muted">Loading session…</p>
              ) : isAuthenticated ? (
                <>
                  <div className="rounded-2xl bg-surface-muted px-4 py-3">
                    <p className="text-sm font-semibold text-primary-dark">{user?.displayName || user?.email}</p>
                    <p className="text-xs text-text-muted">Signed in</p>
                  </div>
                  <Button as={Link} to="/profile" variant="ghost" onClick={closeMobileNav}>
                    Profile
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      await logoutUser()
                      closeMobileNav()
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="ghost" onClick={closeMobileNav}>
                    Log in
                  </Button>
                  <Button as={Link} to="/signup" onClick={closeMobileNav}>
                    Create account
                  </Button>
                </>
              )}
            </div>
          </MotionAside>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )
}
