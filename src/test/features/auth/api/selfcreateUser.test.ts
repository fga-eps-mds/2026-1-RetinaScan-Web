import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { submitInscricao, type SubmitInscricaoDTO } from '@/features/auth/api/selfcreateUser'; // Ajuste o caminho se necessário

// Mock da instância do Axios/API client para isolar o teste da rede real
vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('submitInscricao', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Previne vazamento de estado de chamadas anteriores
  });

  it('deve realizar o POST com o payload correto e retornar os dados desempacotados', async () => {
    const mockPayload: SubmitInscricaoDTO = {
      token: 'token-valido-123',
      nomeCompleto: 'Dr. João Silva',
      cpf: '12345678900',
      crm: '12345SP',
      dtNascimento: '1980-01-01',
      senha: 'senha-segura',
    };
    
    const mockResponseData = { success: true, id: '123' };
    
    // Simula o comportamento padrão do Axios retornando o objeto { data: ... }
    vi.mocked(api.post).mockResolvedValue({ data: mockResponseData });

    const result = await submitInscricao(mockPayload);

    // Valida o contrato da rota, o método HTTP e a injeção do payload
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/api/inscricoes/submeter', mockPayload);
    
    // Valida se a função está extraindo apenas a chave .data da resposta do Axios
    expect(result).toEqual(mockResponseData);
  });

  it('deve propagar o erro para a camada superior caso a requisição falhe', async () => {
    const mockPayload: SubmitInscricaoDTO = {
      token: 'token-invalido',
      nomeCompleto: 'Dra. Maria',
      cpf: '12345678900',
      crm: '54321RJ',
      dtNascimento: '1985-05-05',
      senha: 'senha',
    };
    
    const mockError = new Error('Token inválido ou expirado');
    vi.mocked(api.post).mockRejectedValue(mockError);

    // Garante que a Promise seja rejeitada e capturada corretamente pelo caller
    await expect(submitInscricao(mockPayload)).rejects.toThrow('Token inválido ou expirado');
  });
});