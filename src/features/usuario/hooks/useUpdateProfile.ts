import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../api/updateProfile';
import { userKeys } from '../api/queryKeys';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },
  });
}
