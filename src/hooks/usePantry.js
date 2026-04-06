import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/useAuth'
import {
  getPantry,
  addIngredient,
  updateIngredient,
  deleteIngredient,
} from '@/services/pantry/pantryService'

export function usePantry() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['pantry', user?.uid],
    queryFn: () => getPantry(user.uid),
    enabled: Boolean(user?.uid),
    staleTime: 30_000,
  })
}

export function useAddIngredient() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => addIngredient(user.uid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry', user.uid] }),
  })
}

export function useUpdateIngredient() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => updateIngredient(user.uid, id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry', user.uid] }),
  })
}

export function useDeleteIngredient() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteIngredient(user.uid, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['pantry', user.uid] })
      const previous = queryClient.getQueryData(['pantry', user.uid])
      queryClient.setQueryData(['pantry', user.uid], (old) =>
        old ? old.filter((item) => item.id !== id) : old
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['pantry', user.uid], context.previous)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['pantry', user.uid] }),
  })
}
