import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacaoKeys } from '../api/queryKeys';
import { aceitarSolicitacaoCrm } from '../api/aprovarSolicitacaoCrm';

export function useAceitarSolicitacaoCrm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aceitarSolicitacaoCrm(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificacaoKeys.solicitacoesCpfCrmList,
        }),
        queryClient.invalidateQueries({
          queryKey: notificacaoKeys.minhasSolicitacoesCpfCrm,
        }),
      ]);
    },
  });
}
