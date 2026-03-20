import { useState } from 'react'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'

export function AppImage({ src, alt, className = '', fallbackSrc = FALLBACK_IMAGE, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)

  return (
    <img
      {...props}
      src={currentSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }}
    />
  )
}
