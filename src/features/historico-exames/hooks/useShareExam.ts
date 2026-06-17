import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  searchMedicosApi, 
  generateShareLinkApi, 
  type MedicoBusca, 
  type SharePayload, 
  type ShareResponse 
} from '../api/shareExam';

export interface CompartilhamentoItem {
  idCompartilhamento: string;
  medicoNome: string;
  medicoCrm: string;
  medicoEmail: string;
  expiraEm: string | null;
  linkAcesso: string;
  criadoEm: string;
}
//  buscar médicos com na pesquisa
export function useSearchMedicos(searchTerm: string, enabled: boolean) {
  return useQuery<MedicoBusca[]>({
    queryKey: ['medicos-search', searchTerm],
    queryFn: () => searchMedicosApi(searchTerm),
    enabled: enabled && searchTerm.length > 2, // Evita buscas desnecessárias para termos curtos
  });
}

//criar o compartilhamento e gerar o link
export function useGenerateShareLink(examId: string | undefined) {
  return useMutation<ShareResponse, Error, SharePayload>({
    mutationFn: (payload) => generateShareLinkApi(examId, payload), 
  });
}