import { useMutation } from '@tanstack/react-query';
import { requestPasswordRecovery } from '../api/requestPasswordReset';

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordRecovery,
  });
}
