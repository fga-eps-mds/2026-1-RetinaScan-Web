import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { getInscricoesPendentes, type InscricaoPendente } from '@/features/notificacoes/api/getInscricoesPendentes';

vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getInscricoesPendentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInscricoes: InscricaoPendente[] = [
    {
      id: 'INSC-001',
      email: 'medico@email.com',
      token: 'token-xyz',
      tokenExpiresAt: '2026-06-20T10:00:00Z',
      status: 'PENDENTE',
      invitedBy: 'admin-id',
      nomeCompleto: 'João Médico',
      tipoPerfil: 'MEDICO',
      cpf: '12345678900',
      crm: '12345-SP',
      dtNascimento: '1980-01-01',
      submittedAt: '2026-06-14T10:00:00Z',
      motivoRejeicao: null,
      analisadoPor: null,
      analisadoEm: null,
      createdAt: '2026-06-14T10:00:00Z',
      updatedAt: '2026-06-14T10:00:00Z',
    },
  ];

  it('deve chamar a API com o status padrão PENDENTE quando nenhum parâmetro for enviado', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: mockInscricoes } });

    const result = await getInscricoesPendentes();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/api/inscricoes', {
      params: { status: 'PENDENTE' },
    });
    expect(result).toEqual(mockInscricoes);
  });

  it('deve chamar a API com o status específico informado', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } });

    await getInscricoesPendentes('CONVITE_ENVIADO');

    expect(api.get).toHaveBeenCalledWith('/api/inscricoes', {
      params: { status: 'CONVITE_ENVIADO' },
    });
  });

  it('não deve enviar parâmetros de status quando o filtro for TODAS', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } });

    await getInscricoesPendentes('TODAS');

    expect(api.get).toHaveBeenCalledWith('/api/inscricoes', {
      params: undefined,
    });
  });

  it('deve repassar o erro caso a requisição falhe', async () => {
    const mockError = new Error('Falha na conexão');
    vi.mocked(api.get).mockRejectedValue(mockError);

    await expect(getInscricoesPendentes()).rejects.toThrow('Falha na conexão');
  });
});