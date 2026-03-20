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
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before authentication completed.'
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already open.'
    case 'auth/account-exists-with-different-credential':
      return 'That email is already linked to a different sign-in method.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication.'
    case 'auth/operation-not-allowed':
      return 'That sign-in provider is not enabled in Firebase Authentication.'
    case 'auth/invalid-phone-number':
      return 'Enter a valid phone number with country code, for example +15551234567.'
    case 'auth/invalid-verification-code':
      return 'That verification code is incorrect.'
    case 'auth/code-expired':
      return 'That verification code expired. Request a new one.'
    case 'auth/too-many-requests':
      return 'Too many attempts were made. Wait a moment and try again.'
    case 'auth/missing-phone-number':
      return 'Enter a phone number to receive a verification code.'
    case 'auth/missing-verification-id':
      return 'Request a verification code before entering the SMS code.'
    case 'auth/missing-verification-code':
      return 'Enter the verification code from your SMS message.'
    case 'app/phone-browser-required':
      return 'Phone authentication is only available in the browser.'
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Firebase is configured incorrectly. Check the app environment variables.'
    default:
      return 'Authentication failed. Please try again.'
  }
}
