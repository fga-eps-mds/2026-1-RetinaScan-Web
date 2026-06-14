import { useQuery, useMutation } from '@tanstack/react-query';

interface MedicoBusca {
  id: string;
  nomeCompleto: string;
  email: string;
  crm: string;
}

interface SharePayload {
  email: string;
  expiraEm: string | null;
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

// 🔘 MUDE PARA 'true' PARA TESTAR O FRONT-END COM O MOCK DO WHATSAPP
const USAR_MOCK_PARA_TESTE = true;

// 🔘 SE SELECIONAR 'true', VAI SIMULAR O ERRO 409 (CONFLITO). SE 'false', SIMULA SUCESSO.
const SIMULAR_ERRO_CONFLITO = false;

export function useSearchMedicos(searchTerm: string, enabled: boolean) {
  return useQuery<MedicoBusca[]>({
    queryKey: ['medicos-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      if (USAR_MOCK_PARA_TESTE) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return [
          {
            id: "a1b2c3d4-mock",
            nomeCompleto: "Dr. João Silva",
            email: "medico.solicitante@hospital.com",
            crm: "12345"
          }
        ];
      }

      const response = await fetch(`/api/medicos/search?tipoPerfil=MEDICO&q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Erro ao buscar médicos');
      return response.json();
    },
    enabled: enabled && searchTerm.length > 2,
  });
}

export function useGenerateShareLink(examId: string | undefined) {
  return useMutation<ShareResponse, Error, SharePayload>({
    mutationFn: async (payload) => {
      
      if (USAR_MOCK_PARA_TESTE) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulação do Erro 409 Conflict enviado no WhatsApp
        if (SIMULAR_ERRO_CONFLITO) {
          throw new Error("Este exame já está compartilhado com o Dr. João Silva e o acesso ainda está ativo.");
        }

        // Simulação do Caso de Sucesso enviado no WhatsApp
        return {
          message: "Exame compartilhado com sucesso.",
          data: {
            idCompartilhamento: "f7b2c9a1-8d3e-4b5c-9f1a-2d3e4f5a6b7c",
            exameId: examId ?? "12345",
            medicoDestino: {
              id: "a1b2c3d4-...",
              crm: "12345"
            },
            expiraEm: payload.expiraEm,
            linkAcesso: `https://app.retinascan.dev/exames/${examId ?? '12345'}`
          }
        };
      }

      // Chamada real à API quando estiver online
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