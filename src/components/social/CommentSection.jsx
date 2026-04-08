import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CommentItem } from './CommentItem'
import { useComments, useAddComment } from '@/hooks/useComments'
import { useAuth } from '@/context/useAuth'

export function CommentSection({ recipeId }) {
  const { isAuthenticated } = useAuth()
  const { data: comments = [], isLoading } = useComments(recipeId)
  const addComment = useAddComment(recipeId)
  const [text, setText] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addComment.mutateAsync(text)
    setText('')
  }

  return (
    <section className="space-y-4">
      <h2 className="font-heading font-semibold">
        Comments
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-text-muted">({comments.length})</span>
        )}
      </h2>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <textarea
            className="input flex-1 resize-none"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            maxLength={500}
            disabled={addComment.isPending}
          />
          <Button type="submit" disabled={addComment.isPending || !text.trim()}>
            {addComment.isPending ? 'Posting…' : 'Post'}
          </Button>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-muted">No comments yet. Be the first!</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} recipeId={recipeId} />
          ))}
        </div>
      )}
    </section>
  )
}
