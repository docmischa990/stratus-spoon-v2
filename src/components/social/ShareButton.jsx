import { Button } from '@/components/ui/Button'

export function ShareButton({ recipeId, title }) {
  const recipeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/recipes/${recipeId}`
    : `/recipes/${recipeId}`

  const encodedUrl = encodeURIComponent(recipeUrl)
  const encodedTitle = encodeURIComponent(title || 'Check out this recipe')

  const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`

  async function copyLink() {
    await navigator.clipboard.writeText(recipeUrl)
    alert('Link copied to clipboard!')
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="ghost">Share on WhatsApp</Button>
      </a>
      <Button variant="ghost" onClick={copyLink}>
        Copy link
      </Button>
    </div>
  )
}
