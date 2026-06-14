import { useQuery, useMutation } from '@tanstack/react-query';

interface MedicoBusca {
  id: string;
  nomeCompleto: string;
  email: string;
  crm: string;
}

interface SharePayload {
  email: string;
  expiraEm: string | null; // caso tenha acesso permanente, expiraEm=null
}

interface ShareResponse {
  message: string;
  data: {
    idCompartilhamento: string;
    exameId: string;
    medicoDestino: {
      id: string;
      crm: string;
    };
    expiraEm: string | null;
    linkAcesso: string;
  };
}
const USAR_MOCK_PARA_TESTE = true; // Toggle para alternar entre mock e API real

// Busca por Nome, CRM ou E-mail
export function useSearchMedicos(searchTerm: string, enabled: boolean) {
  return useQuery<MedicoBusca[]>({
    queryKey: ['medicos-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      // Fluxo de simulação/mock para testes locais no Front-end
      if (USAR_MOCK_PARA_TESTE) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return [
          {
            id: "medico-teste-123",
            nomeCompleto: "Dr. João Silva (Médico de Teste)",
            email: "medico.solicitante@hospital.com",
            crm: "667755/DF"
          }
        ];
      }

      // Fluxo Oficial: Chamada real para a API integrada ao Banco de Dados
      const response = await fetch(
        `/api/medicos/search?tipoPerfil=MEDICO&q=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) throw new Error('Erro ao buscar médicos');
      return response.json();
    },
    enabled: enabled && searchTerm.length > 2,
  });
}

// Geração do Link de Compartilhamento Controlado
export function useGenerateShareLink(examId: string | undefined) {
  return useMutation<ShareResponse, Error, SharePayload>({
    mutationFn: async (payload) => {
      // Se estiver apenas testando visualmente, pode simular a resposta aqui também
      if (USAR_MOCK_PARA_TESTE) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          message: "Exame compartilhado com sucesso.",
          data: {
            idCompartilhamento: "mock-id-123",
            exameId: examId ?? "12345",
            medicoDestino: { id: "medico-teste-123", crm: "667755/DF" },
            expiraEm: payload.expiraEm,
            linkAcesso: `https://app.retinascan.dev/exames/${examId}`
          }
        };
      }

      const response = await fetch(`/api/exames/${examId}/compartilhamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao processar o compartilhamento');
      }

      return response.json();
    },
  });
}