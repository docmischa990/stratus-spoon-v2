import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/create', label: 'Create' },
  { to: '/cookbook', label: 'Cookbook' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/my-recipes', label: 'My Recipes' },
]

export function Navbar() {
  const toggleMobileNav = useUIStore((state) => state.toggleMobileNav)
  const { isAuthenticated, isLoading, logoutUser, user } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6 md:h-[72px]">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-background">
            SS
          </span>
          <div>
            <p className="font-heading text-lg font-semibold text-primary-dark">Stratus Spoon</p>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">v2 foundation</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <span className="text-sm text-text-muted">Loading session…</span>
          ) : isAuthenticated ? (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary-dark">{user?.displayName || user?.email}</p>
                <p className="text-xs text-text-muted">Authenticated</p>
              </div>
              <Button as={Link} to="/profile" variant="ghost">
                Profile
              </Button>
              <Button type="button" onClick={logoutUser}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost">
                Log in
              </Button>
              <Button as={Link} to="/signup">
                Sign up
              </Button>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="md:hidden"
          onClick={toggleMobileNav}
          aria-label="Open navigation"
        >
          Menu
        </Button>
      </div>
    </header>
  )
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-xl px-3 py-2 text-sm font-medium text-text-muted hover:bg-primary-dark/5 hover:text-primary-dark',
          isActive && 'bg-primary-dark/5 text-primary-dark',
        )
      }
    >
      {label}
    </NavLink>
  )
}
