import { useMutation } from '@tanstack/react-query';
import { submitInscricao } from '../api/selfcreateUser';

export function useSubmitInscricao() {
  return useMutation({
    mutationFn: submitInscricao,
  });
}
