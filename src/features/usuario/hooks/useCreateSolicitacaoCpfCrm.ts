import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSolicitacaoCpfCrm } from '../api/createSolicitacaoCpfCrm';
import { userKeys } from '../api/queryKeys';

export function useCreateSolicitacaoCpfCrm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSolicitacaoCpfCrm,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: userKeys.solicitacoesCpfCrm,
        }),
        queryClient.invalidateQueries({
          queryKey: userKeys.profile,
        }),
      ]);
    },
  });
}