import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aceitarSolicitacaoCrm } from '@/features/notificacoes/api/aprovarSolicitacaoCrm'

import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    patch: vi.fn(),
  },
}));

describe('aceitarSolicitacaoCrm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar o endpoint correto com o ID fornecido', async () => {
    const mockId = 'solicitacao-123';
    const mockResponse = { success: true };
    
    vi.mocked(api.patch).mockResolvedValueOnce({ data: mockResponse });

    const result = await aceitarSolicitacaoCrm(mockId);

    expect(api.patch).toHaveBeenCalledWith(
      `/api/usuarios/solicitacoes-cpf-crm/${mockId}/aprovar`
    );
    expect(result).toEqual(mockResponse);
  });

  it('deve propagar o erro quando a API falhar', async () => {
    const apiError = new Error('Erro na API');
    vi.mocked(api.patch).mockRejectedValueOnce(apiError);

    await expect(aceitarSolicitacaoCrm('123')).rejects.toThrow('Erro na API');
  });
});