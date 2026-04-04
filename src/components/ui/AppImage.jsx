import { useState } from 'react'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'

function isValidImageSrc(value) {
  if (typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return false
  }

  return /^https?:\/\//i.test(trimmedValue) || trimmedValue.startsWith('data:image/')
}

export function AppImage({ src, alt, className = '', fallbackSrc = FALLBACK_IMAGE, ...props }) {
  const normalizedSrc = isValidImageSrc(src) ? src : fallbackSrc
  const [failedSrcs, setFailedSrcs] = useState(() => new Set())
  const resolvedSrc = failedSrcs.has(normalizedSrc) ? fallbackSrc : normalizedSrc

  return (
    <img
      {...props}
      src={resolvedSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) {
          setFailedSrcs((current) => {
            const next = new Set(current)
            next.add(normalizedSrc)
            return next
          })
        }
      }}
    />
  )
}
