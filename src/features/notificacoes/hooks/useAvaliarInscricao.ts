import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  avaliarInscricao,
  type AvaliarInscricaoPayload,
} from '../api/avaliarInscricao';

export const useAvaliarInscricao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AvaliarInscricaoPayload;
    }) => avaliarInscricao(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['inscricoes'],
      });
    },
  });
};
