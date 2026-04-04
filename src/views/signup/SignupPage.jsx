import { Navigate } from '@/lib/router'
import { AuthFormCard } from '@/components/auth/AuthFormCard'
import { PageSection } from '@/components/ui/PageSection'
import { useAuth } from '@/context/useAuth'

export function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/cookbook" replace />
  }

  return (
    <PageSection className="pt-10 md:pt-16">
      <div className="container flex justify-center">
        <AuthFormCard mode="signup" />
      </div>
    </PageSection>
  )
}
