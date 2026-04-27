import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSolicitacaoCpfCrm } from '@/features/usuario/api/createSolicitacaoCpfCrm';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('createSolicitacaoCpfCrm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar o endpoint correto com o payload fornecido', async () => {
    const mockPayload = {
      cpfNovo: '123.456.789-00',
      crmNovo: '123456/SP',
    };
    const mockResponse = { success: true, id: '123' };
    
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await createSolicitacaoCpfCrm(mockPayload);

    expect(api.post).toHaveBeenCalledWith(
      '/api/usuarios/solicitacoes-cpf-crm',
      mockPayload
    );
    expect(result).toEqual(mockResponse);
  });

  it('deve propagar erro quando a requisição falhar', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Erro ao criar'));

    await expect(
      createSolicitacaoCpfCrm({ cpfNovo: '1', crmNovo: '2' })
    ).rejects.toThrow('Erro ao criar');
  });
});