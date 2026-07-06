import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '../api/queryKeyrs';
import { createUser } from '../api/createUser';

// Hook personalizado para criar um novo usuário e invalidar a cache de usuários após a criação
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}
