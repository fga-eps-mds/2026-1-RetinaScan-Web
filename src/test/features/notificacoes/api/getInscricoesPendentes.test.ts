import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { getInscricoesPendentes, type InscricaoPendente } from '@/features/notificacoes/api/getInscricoesPendentes';

// Mock da instância de API
vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getInscricoesPendentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a API com os parâmetros corretos e extrair o array de dados', async () => {
    // Arrange: Prepara os dados simulados
    const mockInscricoes: InscricaoPendente[] = [
      {
        id: 'INSC-001',
        email: 'medico@email.com',
        nomeCompleto: 'João Médico',
        cpf: '12345678900',
        crm: '12345-SP',
        dtNascimento: '1980-01-01',
        status: 'CONVITE_ENVIADO',
        submittedAt: '2026-06-14T10:00:00Z',
        createdAt: '2026-06-14T10:00:00Z',
        updatedAt: '2026-06-14T10:00:00Z',
      },
    ];

    // Simula a estrutura exata que o axios + backend retornariam
    const mockAxiosResponse = {
      data: {
        data: mockInscricoes,
      },
    };

    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockAxiosResponse);

    // Act: Executa a função
    const result = await getInscricoesPendentes();

    // Assert: Verifica se a URL e os params (status) foram enviados corretamente
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/api/inscricoes', {
      params: { status: 'CONVITE_ENVIADO' },
    });
    
    // Verifica se a função desempacotou corretamente o response.data.data
    expect(result).toEqual(mockInscricoes);
  });

  it('deve repassar o erro caso a requisição falhe', async () => {
    // Arrange: Simula uma falha na rede ou servidor
    const mockError = new Error('Falha na conexão');
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Act & Assert: Garante que o erro é lançado para quem chamou a função
    await expect(getInscricoesPendentes()).rejects.toThrow('Falha na conexão');
  });
});