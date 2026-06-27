import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSolicitacao } from '../api/deleteSolicitacaoCrm';
import { notificacaoKeys } from '../api/queryKeys';

export function useDeleteSolicitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSolicitacao(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificacaoKeys.solicitacoesCpfCrmList,
      });
    },
  });
}