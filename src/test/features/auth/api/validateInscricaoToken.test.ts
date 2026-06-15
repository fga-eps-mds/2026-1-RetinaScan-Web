import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import axios from 'axios';
import { 
  validateInscricaoToken, 
  type ValidateInscricaoTokenResponse 
} from '@/features/auth/api/validateInscricaoToken'; // Ajuste o caminho se necessário

// Mock da instância da API
vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock do Axios para controlar o comportamento do isAxiosError sem precisar de instâncias reais
vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn(),
  },
}));

describe('validateInscricaoToken', () => {
  const mockToken = 'token-com-caracteres-especiais/+=';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve realizar o GET com o token codificado na URL e retornar os dados em caso de sucesso', async () => {
    const mockResponseData: ValidateInscricaoTokenResponse = {
      email: 'medico@email.com',
      nomeCompleto: 'Dr. Silva',
      tipoPerfil: 'MEDICO',
      tokenExpiresAt: '2026-12-31T23:59:59Z',
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponseData });

    const result = await validateInscricaoToken(mockToken);

    // Valida se o encodeURIComponent foi aplicado corretamente na URL
    const expectedUrl = `/api/inscricoes/convites/${encodeURIComponent(mockToken)}`;
    
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockResponseData);
  });

  it('deve lançar a mensagem de erro específica da API se for um erro do Axios', async () => {
    const mockApiError = {
      response: { data: { message: 'Token já foi utilizado.' } },
    };

    vi.mocked(api.get).mockRejectedValue(mockApiError);
    // Forçamos o mock a simular que o erro capturado é estruturalmente um erro do Axios
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(validateInscricaoToken(mockToken)).rejects.toThrow('Token já foi utilizado.');
  });

  it('deve usar o fallback de erro de link se a API não retornar uma mensagem dentro do erro do Axios', async () => {
    // Erro do Axios sem a propriedade message no corpo da resposta
    const mockApiError = {
      response: { data: {} },
    };

    vi.mocked(api.get).mockRejectedValue(mockApiError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(validateInscricaoToken(mockToken)).rejects.toThrow('Link inválido ou expirado.');
  });

  it('deve lançar erro genérico de rede/servidor caso não seja um erro do Axios (ex: TypeError, Network Error)', async () => {
    const mockGenericError = new Error('Falha de conexão genérica');

    vi.mocked(api.get).mockRejectedValue(mockGenericError);
    // Simulamos que a validação do Axios falhou (ex: o backend caiu antes de responder)
    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    await expect(validateInscricaoToken(mockToken)).rejects.toThrow('Erro de rede ou servidor.');
  });
});