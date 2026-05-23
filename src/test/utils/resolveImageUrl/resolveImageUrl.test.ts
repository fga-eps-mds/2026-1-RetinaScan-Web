import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveImageUrl } from '@/utils/resolveImageUrl/resolveImageUrl';
import { api } from '@/shared/api';

// Mock do Axios/API
vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('resolveImageUrl', () => {
  const originalEnvDev = import.meta.env.DEV;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock do URL.createObjectURL (necessário porque o Node.js não possui isso nativamente)
   (globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mocked-blob-url');

    // Mock do console.error para evitar poluir o terminal durante o teste de falha
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaura o ambiente original após cada teste
    import.meta.env.DEV = originalEnvDev;
    vi.restoreAllMocks();
  });

  it('deve retornar undefined se a url não for fornecida', async () => {
    expect(await resolveImageUrl()).toBeUndefined();
    expect(await resolveImageUrl('')).toBeUndefined();
  });

  it('deve retornar a url original se NÃO estiver no ambiente de desenvolvimento', async () => {
    // Simulando ambiente de Produção
    import.meta.env.DEV = false;

    const url = 'https://meu-ngrok-url.io/imagem.jpg';
    const result = await resolveImageUrl(url);

    expect(result).toBe(url);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('deve retornar a url original em DEV se a url NÃO contiver "ngrok"', async () => {
    // Simulando ambiente DEV
    import.meta.env.DEV = true;

    const url = 'https://s3.aws.com/minha-imagem.jpg';
    const result = await resolveImageUrl(url);

    expect(result).toBe(url);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('deve buscar o blob e criar uma URL de objeto em DEV para URLs do ngrok', async () => {
    import.meta.env.DEV = true;
    const url = 'https://api-123.ngrok.io/imagem.jpg';
    
    // Simula o retorno de um Blob (arquivo binário da imagem)
    const mockBlob = new Blob(['conteudo-fake-da-imagem'], { type: 'image/jpeg' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockBlob });

    const result = await resolveImageUrl(url);

    // Verifica se fez a requisição com os headers corretos para o ngrok
    expect(api.get).toHaveBeenCalledWith(url, {
      responseType: 'blob',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // Verifica se usou a API do navegador para gerar a URL local
    expect((globalThis as any).URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    
    // Verifica se retornou a URL gerada pelo mock
    expect(result).toBe('blob:http://localhost/mocked-blob-url');
  });

  it('deve fazer o fallback para a url original caso a requisição do ngrok falhe', async () => {
    import.meta.env.DEV = true;
    const url = 'https://api-123.ngrok.io/imagem-quebrada.jpg';
    const mockError = new Error('Network Error');
    
    vi.mocked(api.get).mockRejectedValueOnce(mockError);

    const result = await resolveImageUrl(url);

    // O console.error deve ser acionado com os dados do erro
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar imagem do ngrok:',
      url,
      mockError
    );

    // Apesar do erro, a aplicação não deve quebrar, apenas retornar a url crua
    expect(result).toBe(url);
  });
});