import { Navigate, useLocation } from '@/lib/router'
import { useAuth } from '@/context/useAuth'

export function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="card-base p-6">
          <p className="text-sm text-text-muted">Restoring your session…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname || '/cookbook')}`} replace />
  }

  return children
}
