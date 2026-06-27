import { api } from '@/shared/api';

export interface MedicoBusca {
  id: string;
  nomeCompleto: string;
  email: string;
  crm: string;
}

export interface SharePayload {
  emailDestino: string; 
  expiraEm: string | null;
}

export interface ShareResponse {
  message: string;
  data: {
    id: string;
    examId: string; 
    medicoDestinoId: string; 
    compartilhadoPor: string; 
    expiraEm: string | null;
  };
}

// Adaptado de acordo com o que a sua rota GET costuma retornar
export interface CompartilhamentoItem {
  id: string; // ID do compartilhamento (usado para deletar)
  medicoDestino: {
    nomeCompleto: string;
    crm: string;
    email: string;
  };
  expiraEm: string | null;
  criadoEm: string;
}

// Busca por profissionais médicos
export async function searchMedicosApi(searchTerm: string): Promise<MedicoBusca[]> {
  if (!searchTerm) return [];
  const response = await api.get<MedicoBusca[]>('/api/medicos/disponiveis', {
    params: { busca: searchTerm }
  });
  return response.data;
}

// Cria o compartilhamento
export async function generateShareLinkApi(examId: string | undefined, payload: SharePayload): Promise<ShareResponse> {
  if (!examId) throw new Error('ID do exame inválido');
  try {
    const response = await api.post<ShareResponse>(`/api/exams/${examId}/share`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Este profissional já possui acesso a este exame. Use a lista abaixo para copiar o link.');
    }
    const errorData = error.response?.data;
    throw new Error(errorData?.message || 'Erro ao processar o compartilhamento');
  }
}

// Lista os acessos ativos do exame
export async function getExamSharesApi(examId: string): Promise<CompartilhamentoItem[]> {
  const response = await api.get(`/api/exams/${examId}/shares`);
  
  // Tratamento para retornar um array e evitar erro .map
  const shares = response.data?.data || response.data;
  return Array.isArray(shares) ? shares : [];
}

//Revoga o acesso
export async function revokeShareApi(examId: string, shareId: string): Promise<void> {
  await api.delete(`/api/exams/${examId}/shares/${shareId}`);
}