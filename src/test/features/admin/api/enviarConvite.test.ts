import { describe, it, expect, vi } from 'vitest';
import { api } from '@/shared/api';
import { enviarConvite } from '@/features/admin/api/enviarConvite';
import { type EnviarConvitePayload } from '@/features/admin/api/enviarConvite';

// Faz o mock da instância de API do projeto
vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('enviarConvite', () => {
  it('deve chamar a API com a URL e o payload corretos e retornar os dados', async () => {
    // Arrange: Prepara os dados falsos para o teste
    const mockPayload: EnviarConvitePayload = {
      convites: [
        { email: 'teste@email.com', nome: 'Teste', tipoPerfil: 'MEDICO' },
      ],
    };

    const mockResponseData = {
      enviados: 1,
      ignorados: 0,
      detalhes: [
        { email: 'teste@email.com', status: 'enviado' }
      ]
    };

    // Diz ao mock da API o que ele deve retornar quando o `.post` for chamado
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResponseData });

    // Act: Executa a função
    const result = await enviarConvite(mockPayload);

    // Assert: Verifica se tudo aconteceu como esperado
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/api/inscricoes/convites', mockPayload);
    expect(result).toEqual(mockResponseData);
  });

  it('deve repassar o erro caso a chamada da API falhe', async () => {
    // Arrange: Força a API a retornar um erro
    const mockPayload: EnviarConvitePayload = { convites: [] };
    const mockError = new Error('Erro de rede');
    
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Act & Assert: Verifica se a função lança o mesmo erro
    await expect(enviarConvite(mockPayload)).rejects.toThrow('Erro de rede');
  });
});