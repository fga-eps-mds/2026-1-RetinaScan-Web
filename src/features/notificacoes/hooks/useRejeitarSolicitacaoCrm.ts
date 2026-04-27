import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejeitarSolicitacaoCrm } from '../api/rejeitarSolicitacaoCrm';
import { notificacaoKeys } from '../api/queryKeys';

type RejeitarSolicitacaoCrmVariables = {
  id: string;
  motivoRejeicao: string;
};

export function useRejeitarSolicitacaoCrm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RejeitarSolicitacaoCrmVariables) =>
      rejeitarSolicitacaoCrm(variables),
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
