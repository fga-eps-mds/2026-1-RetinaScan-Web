import { api } from "@/shared/api";

/**
 * Busca o relatório do exame em PDF.
 */
export const downloadLaudoApi = async (exameId: string): Promise<Blob> => {
  const response = await api.get(`/api/report/${exameId}/pdf`, {
    // Obrigatório 'blob' para evitar corrompimento do arquivo binário
    responseType: 'blob', 
  });

  return response.data;
};