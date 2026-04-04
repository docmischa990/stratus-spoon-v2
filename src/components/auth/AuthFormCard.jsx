import { AnimatePresence, motion } from 'framer-motion'
import { useId, useState } from 'react'
import { Link, useLocation, useNavigate } from '@/lib/router'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { getReadableAuthError } from '@/services/firebase/authErrors'
import { fadeUpVariant, pageTransition } from '@/utils/motion'

const MotionSection = motion.section
const MotionParagraph = motion.p

export function AuthFormCard({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const location = useLocation()
  const recaptchaContainerId = useId().replace(/:/g, '')
  const {
    isConfigured,
    loginWithEmail,
    loginWithGoogle,
    loginWithGithub,
    sendPhoneVerificationCode,
    confirmPhoneVerificationCode,
    resetPhoneVerification,
    signupWithEmail,
  } = useAuth()
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: '',
    verificationCode: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [phoneStep, setPhoneStep] = useState('enter-phone')

  const redirectSearch = typeof window !== 'undefined' ? new URLSearchParams(location.search).get('redirect') : null
  const redirectTarget = redirectSearch || '/cookbook'

  function updateField(name, value) {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function resetPhoneState() {
    resetPhoneVerification()
    setPhoneStep('enter-phone')
    setFormState((current) => ({
      ...current,
      verificationCode: '',
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

  async function handleProviderLogin(loginAction) {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await loginAction()
      navigate(redirectTarget, { replace: true })
    } catch (error) {
      setErrorMessage(getReadableAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSendPhoneCode() {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await sendPhoneVerificationCode({
        phoneNumber: formState.phoneNumber,
        containerId: recaptchaContainerId,
      })
      setPhoneStep('enter-code')
    } catch (error) {
      setErrorMessage(getReadableAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmPhoneCode() {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await confirmPhoneVerificationCode({
        verificationCode: formState.verificationCode,
        displayName: formState.displayName,
      })
      navigate(redirectTarget, { replace: true })
    } catch (error) {
      setErrorMessage(getReadableAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MotionSection
      className="card-base w-full max-w-lg p-6 md:p-8"
      variants={fadeUpVariant}
      initial="initial"
      animate="animate"
      transition={pageTransition}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {isLogin ? 'Welcome back' : 'Create account'}
        </p>
        <h1 className="text-3xl font-semibold">{isLogin ? 'Log in to your cookbook' : 'Start building recipes'}</h1>
        <p className="text-sm leading-6 text-text-muted">
          {isConfigured
            ? 'Use your Firebase-backed account to access protected cookbook and creation workflows.'
            : 'Firebase is not configured yet. Add the Next.js public Firebase environment variables to enable login.'}
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
        <AnimatePresence mode="wait">
          {errorMessage ? (
            <MotionParagraph
              key={errorMessage}
              className="text-sm font-medium text-danger"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {errorMessage}
            </MotionParagraph>
          ) : null}
        </AnimatePresence>
        <Button className="w-full" disabled={isSubmitting || !isConfigured}>
          {isSubmitting ? 'Submitting…' : isLogin ? 'Log in' : 'Create account'}
        </Button>
      </form>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-text-muted">
          <span className="h-px flex-1 bg-border" />
          <span>or continue with</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isSubmitting || !isConfigured}
            onClick={() => handleProviderLogin(loginWithGoogle)}
          >
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={isSubmitting || !isConfigured}
            onClick={() => handleProviderLogin(loginWithGithub)}
          >
            Continue with GitHub
          </Button>
        </div>
      </div>
      <div className="mt-5 space-y-4 rounded-2xl border border-border bg-surface-muted/60 p-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Phone verification</p>
          <p className="text-sm leading-6 text-text-muted">
            Sign in with an SMS code. Use international format like <span className="font-medium text-primary-dark">+15551234567</span>.
          </p>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary-dark">Phone number</span>
          <input
            type="tel"
            className="input-base"
            placeholder="+15551234567"
            value={formState.phoneNumber}
            onChange={(event) => updateField('phoneNumber', event.target.value)}
            autoComplete="tel"
          />
        </label>
        {phoneStep === 'enter-code' ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-primary-dark">Verification code</span>
            <input
              inputMode="numeric"
              className="input-base"
              placeholder="123456"
              value={formState.verificationCode}
              onChange={(event) => updateField('verificationCode', event.target.value)}
              autoComplete="one-time-code"
            />
          </label>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          {phoneStep === 'enter-phone' ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isSubmitting || !isConfigured}
              onClick={handleSendPhoneCode}
            >
              {isSubmitting ? 'Sending…' : 'Send verification code'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isSubmitting || !isConfigured}
              onClick={handleConfirmPhoneCode}
            >
              {isSubmitting ? 'Verifying…' : 'Verify and continue'}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={isSubmitting || !isConfigured}
            onClick={phoneStep === 'enter-phone' ? resetPhoneState : handleSendPhoneCode}
          >
            {phoneStep === 'enter-phone' ? 'Reset phone flow' : 'Resend code'}
          </Button>
        </div>
        <div id={recaptchaContainerId} />
      </div>
      <p className="mt-6 text-sm text-text-muted">
        {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
        <Link className="font-semibold text-accent-dark" to={isLogin ? '/signup' : '/login'}>
          {isLogin ? 'Sign up' : 'Log in'}
        </Link>
      </p>
    </MotionSection>
  )
}
