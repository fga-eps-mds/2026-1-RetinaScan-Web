import { useQuery } from '@tanstack/react-query';
import { validateInscricaoToken } from '../api/validateInscricaoToken';

export function useValidateInscricaoToken(token: string) {
  return useQuery({
    queryKey: ['inscricao-token', token],
    queryFn: () => validateInscricaoToken(token),
    enabled: Boolean(token),
  });
}