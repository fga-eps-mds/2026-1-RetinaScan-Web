import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSolicitacoesCpfCrm } from '@/features/notificacoes/api/getSolicitacoesCpfCrm';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getSolicitacoesCpfCrm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar a lista de todas as solicitações corretamente', async () => {
    const mockSolicitacoes = [
      { id: '1', status: 'PENDENTE', nome: 'Medico A' },
      { id: '2', status: 'PENDENTE', nome: 'Medico B' },
    ];
    
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { solicitacoes: mockSolicitacoes },
    });

    const result = await getSolicitacoesCpfCrm();

    expect(api.get).toHaveBeenCalledWith('/api/usuarios/solicitacoes-cpf-crm');
    expect(result).toEqual(mockSolicitacoes);
    expect(result).toHaveLength(2);
  });

  it('deve lançar erro quando a API falhar', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'));

    await expect(getSolicitacoesCpfCrm()).rejects.toThrow('Unauthorized');
  });
});