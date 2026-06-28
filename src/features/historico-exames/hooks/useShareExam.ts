import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  searchMedicosApi, 
  generateShareLinkApi,
  getExamSharesApi,
  revokeShareApi,
  type MedicoBusca, 
  type SharePayload, 
  type ShareResponse,
  type CompartilhamentoItem
} from '../api/shareExam';

export function useSearchMedicos(searchTerm: string, enabled: boolean) {
  return useQuery<MedicoBusca[]>({
    queryKey: ['medicos-search', searchTerm],
    queryFn: () => searchMedicosApi(searchTerm),
    enabled: enabled && searchTerm.length > 2, 
  });
}

export function useGenerateShareLink(examId: string | undefined) {
  const queryClient = useQueryClient();
  
  return useMutation<ShareResponse, Error, SharePayload>({
    mutationFn: (payload) => generateShareLinkApi(examId, payload),
    onSuccess: () => {
      // Atualiza a lista de compartilhamentos automaticamente
      queryClient.invalidateQueries({ queryKey: ['exam-shares', examId] });
    }
  });
}

// listar compartilhamentos
export function useGetExamShares(examId: string, enabled: boolean) {
  return useQuery<CompartilhamentoItem[]>({
    queryKey: ['exam-shares', examId],
    queryFn: () => getExamSharesApi(examId),
    enabled: enabled && !!examId,
  });
}

// deletar compartilhamento
export function useRevokeShare(examId: string) {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (shareId) => revokeShareApi(examId, shareId),
    onSuccess: () => {
      // Atualiza a lista de compartilhamentos após a exclusão
      queryClient.invalidateQueries({ queryKey: ['exam-shares', examId] });
    }
  });
}