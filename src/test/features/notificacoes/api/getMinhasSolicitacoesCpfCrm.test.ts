import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMinhasSolicitacoesCpfCrm } from '@/features/notificacoes/api/getMinhasSolicitacoesCpfCrm';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getMinhasSolicitacoesCpfCrm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar a lista de solicitações corretamente', async () => {
    const mockSolicitacoes = [
      { id: '1', status: 'PENDENTE', cpfNovo: '123' },
      { id: '2', status: 'APROVADO', crmNovo: '456' },
    ];
    
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { solicitacoes: mockSolicitacoes },
    });

    const result = await getMinhasSolicitacoesCpfCrm();

    expect(api.get).toHaveBeenCalledWith('/api/usuarios/minhas-solicitacoes-cpf-crm');
    expect(result).toEqual(mockSolicitacoes);
    expect(result).toHaveLength(2);
  });

  it('deve propagar o erro quando a requisição falhar', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Erro de rede'));

    await expect(getMinhasSolicitacoesCpfCrm()).rejects.toThrow('Erro de rede');
  });
});