import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getComments, addComment, deleteComment } from '@/services/social/commentService'

export function useComments(recipeId) {
  return useQuery({
    queryKey: ['comments', recipeId],
    queryFn: () => getComments(recipeId),
    enabled: Boolean(recipeId),
  })
}

export function useAddComment(recipeId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text) => addComment(recipeId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recipeId] })
    },
  })
}

export function useDeleteComment(recipeId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId) => deleteComment(recipeId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recipeId] })
    },
  })
}
