import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useDeleteComment } from '@/hooks/useComments'

export function CommentItem({ comment, recipeId }) {
  const { user } = useAuth()
  const deleteComment = useDeleteComment(recipeId)

  const isOwn = user?.uid === comment.userId
  const dateStr = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
      <div className="space-y-0.5 flex-1">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="font-semibold text-foreground">{comment.displayName}</span>
          {dateStr && <span>{dateStr}</span>}
        </div>
        <p className="text-sm">{comment.text}</p>
      </div>
      {isOwn && (
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-600"
          disabled={deleteComment.isPending}
          onClick={() => deleteComment.mutate(comment.id)}
        >
          Delete
        </Button>
      )}
    </div>
  )
}
