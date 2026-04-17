import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '../api/queryKeyrs';
import { createUser } from '../api/createUser';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}
