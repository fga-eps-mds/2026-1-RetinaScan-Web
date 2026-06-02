import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../api/resetPassword';

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => resetPassword(data),
  });
}
