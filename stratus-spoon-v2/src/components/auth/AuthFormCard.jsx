import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { getReadableAuthError } from '@/services/firebase/authErrors'

export function AuthFormCard({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const location = useLocation()
  const { isConfigured, loginWithEmail, signupWithEmail } = useAuth()
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    displayName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const redirectTarget = location.state?.from?.pathname || '/cookbook'

  function updateField(name, value) {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (isLogin) {
        await loginWithEmail({
          email: formState.email,
          password: formState.password,
        })
      } else {
        await signupWithEmail({
          email: formState.email,
          password: formState.password,
          displayName: formState.displayName.trim(),
        })
      }

      navigate(redirectTarget, { replace: true })
    } catch (error) {
      setErrorMessage(getReadableAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card-base w-full max-w-lg p-6 md:p-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {isLogin ? 'Welcome back' : 'Create account'}
        </p>
        <h1 className="text-3xl font-semibold">{isLogin ? 'Log in to your cookbook' : 'Start building recipes'}</h1>
        <p className="text-sm leading-6 text-text-muted">
          {isConfigured
            ? 'Use your Firebase-backed account to access protected cookbook and creation workflows.'
            : 'Firebase is not configured yet. Add the Vite Firebase environment variables to enable login.'}
        </p>
      </div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Email</span>
          <input
            type="email"
            className="input-base"
            placeholder="you@example.com"
            value={formState.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Password</span>
          <input
            type="password"
            className="input-base"
            placeholder="••••••••"
            value={formState.password}
            onChange={(event) => updateField('password', event.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </label>
        {!isLogin ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-primary-dark">Display name</span>
            <input
              className="input-base"
              placeholder="Mara Ellis"
              value={formState.displayName}
              onChange={(event) => updateField('displayName', event.target.value)}
              autoComplete="name"
            />
          </label>
        ) : null}
        {errorMessage ? <p className="text-sm font-medium text-danger">{errorMessage}</p> : null}
        <Button className="w-full" disabled={isSubmitting || !isConfigured}>
          {isSubmitting ? 'Submitting…' : isLogin ? 'Log in' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-text-muted">
        {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
        <Link className="font-semibold text-accent-dark" to={isLogin ? '/signup' : '/login'}>
          {isLogin ? 'Sign up' : 'Log in'}
        </Link>
      </p>
    </section>
  )
}
