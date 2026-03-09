export function getReadableAuthError(error) {
  if (!error?.code) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect.'
    case 'auth/email-already-in-use':
      return 'That email is already in use.'
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Firebase is configured incorrectly. Check the app environment variables.'
    default:
      return 'Authentication failed. Please try again.'
  }
}
