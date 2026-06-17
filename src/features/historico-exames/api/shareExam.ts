
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

// Busca por profissionais médicos
export async function searchMedicosApi(searchTerm: string): Promise<MedicoBusca[]> {
  if (!searchTerm) return [];
  
  const response = await api.get<MedicoBusca[]>('/api/medicos/search', {
    params: {
      tipoPerfil: 'MEDICO',
      q: searchTerm
    }
  });
  
  return response.data;
}

// Gera o link de compartilhamento do exame
export async function generateShareLinkApi(examId: string | undefined, payload: SharePayload): Promise<ShareResponse> {
  try {
    const response = await api.post<ShareResponse>(`/api/exams/${examId}/share`, payload);
    
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    throw new Error(errorData?.message || 'Erro ao processar o compartilhamento');
  }
}