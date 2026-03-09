import { Navigate, useLocation } from 'react-router-dom'
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
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
