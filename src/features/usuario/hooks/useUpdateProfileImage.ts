import { useMutation } from '@tanstack/react-query';
import { updateProfileImage } from '../api/updateProfileImage';

export function useUpdateProfileImage() {
  return useMutation({
    mutationFn: updateProfileImage,
  });
}
