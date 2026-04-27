import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rejeitarSolicitacaoCrm } from '@/features/notificacoes/api/rejeitarSolicitacaoCrm';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    patch: vi.fn(),
  },
}));

describe('rejeitarSolicitacaoCrm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve enviar o ID na URL e o motivo da rejeição no corpo da requisição', async () => {
    const params = {
      id: 'solicitacao-abc',
      motivoRejeicao: 'Documentação ilegível',
    };
    const mockResponse = { success: true };
    
    vi.mocked(api.patch).mockResolvedValueOnce({ data: mockResponse });

    const result = await rejeitarSolicitacaoCrm(params);

    expect(api.patch).toHaveBeenCalledWith(
      `/api/usuarios/solicitacoes-cpf-crm/${params.id}/rejeitar`,
      { motivoRejeicao: params.motivoRejeicao }
    );
    expect(result).toEqual(mockResponse);
  });

  it('deve propagar o erro caso a API retorne falha', async () => {
    vi.mocked(api.patch).mockRejectedValueOnce(new Error('Erro ao rejeitar'));

    await expect(
      rejeitarSolicitacaoCrm({ id: '1', motivoRejeicao: 'teste' })
    ).rejects.toThrow('Erro ao rejeitar');
  });
});