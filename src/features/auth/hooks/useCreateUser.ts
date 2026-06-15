import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '@/features/admin/api/queryKeyrs';
import { createUser } from '@/features/admin/api/createUser';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}
