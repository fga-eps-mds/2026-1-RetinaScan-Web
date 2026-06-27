import { describe, expect, it, vi } from 'vitest';
import { downloadLaudoApi } from '@/features/historico-exames/api/downloadLaudo';
import { api } from '@/shared/api';

// Faz o mock da instância do Axios
vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('downloadLaudoApi', () => {
  it('deve chamar a rota correta com responseType blob e retornar o Blob', async () => {
    // Configura o mock para retornar um objeto com a propriedade data
    const mockBlob = new Blob(['fake-pdf'], { type: 'application/pdf' });
    vi.mocked(api.get).mockResolvedValue({ data: mockBlob });

    const exameId = 'EX-2026-0036';
    const result = await downloadLaudoApi(exameId);

    // Valida se a URL e a configuração obrigatória foram passadas corretamente
    expect(api.get).toHaveBeenCalledWith(`/api/report/${exameId}/pdf`, {
      responseType: 'blob',
    });

    // Valida se a função retorna exatamente o conteúdo de response.data
    expect(result).toBe(mockBlob);
  });

  it('deve repassar o erro caso a requisição falhe', async () => {
    const error = new Error('Erro de rede');
    vi.mocked(api.get).mockRejectedValue(error);

    await expect(downloadLaudoApi('EX-123')).rejects.toThrow('Erro de rede');
  });
});