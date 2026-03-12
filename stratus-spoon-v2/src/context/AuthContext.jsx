import { createContext, useEffect, useMemo, useState } from 'react'
import {
  confirmPhoneVerificationCode,
  getAuthStatus,
  loginWithGithub,
  loginWithGoogle,
  loginWithEmail,
  logoutUser,
  resetPhoneVerification,
  sendPhoneVerificationCode,
  signupWithEmail,
  subscribeToAuthState,
} from '@/services/firebase/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    let isMounted = true

    getAuthStatus().then((authStatus) => {
      if (!isMounted) {
        return
      }

      setIsConfigured(authStatus.isConfigured)
      setUser(authStatus.user)
      setStatus('ready')
    })

    const unsubscribe = subscribeToAuthState((nextUser) => {
      if (!isMounted) {
        return
      }

      setUser(nextUser)
      setStatus('ready')
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isConfigured,
      isLoading: status === 'loading',
      isAuthenticated: Boolean(user),
      loginWithEmail,
      loginWithGoogle,
      loginWithGithub,
      sendPhoneVerificationCode,
      confirmPhoneVerificationCode,
      resetPhoneVerification,
      signupWithEmail,
      logoutUser,
    }),
    [isConfigured, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
