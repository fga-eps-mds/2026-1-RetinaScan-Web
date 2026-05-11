import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getExams } from '@/features/historico-exames/api/getExams';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getExams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a API sem query params quando nenhum parâmetro for informado', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 1,
        },
      },
    });

    const result = await getExams({});

    expect(api.get).toHaveBeenCalledWith('/api/exams?');
    expect(result).toEqual({
      data: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1,
      },
    });
  });

  it('deve incluir apenas cpf na query string quando informado', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true },
    });

    await getExams({ cpf: '12345678900' });

    expect(api.get).toHaveBeenCalledWith('/api/exams?cpf=12345678900');
  });

  it('deve incluir apenas nomeCompleto na query string quando informado', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true },
    });

    await getExams({ nomeCompleto: 'Ana Silva' });

    expect(api.get).toHaveBeenCalledWith('/api/exams?nomeCompleto=Ana+Silva');
  });

  it('deve incluir page e pageSize na query string quando informados', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true },
    });

    await getExams({ page: 2, pageSize: 10 });

    expect(api.get).toHaveBeenCalledWith('/api/exams?page=2&pageSize=10');
  });

  it('deve montar a query string com múltiplos parâmetros', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true },
    });

    await getExams({
      cpf: '12345678900',
      nomeCompleto: 'Bruno Costa',
      page: 3,
      pageSize: 15,
    });

    expect(api.get).toHaveBeenCalledWith(
      '/api/exams?cpf=12345678900&nomeCompleto=Bruno+Costa&page=3&pageSize=15'
    );
  });

  it('deve retornar response.data', async () => {
    const mockResponseData = {
      data: [
        {
          id: 'EX-1234-5678',
          nomeCompleto: 'Ana Silva',
          olho: 'OD',
          scoreIA: '90',
          status: 'Normal',
          dtCriacao: '2026-05-10T10:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      },
    };

    vi.mocked(api.get).mockResolvedValue({
      data: mockResponseData,
    });

    const result = await getExams({
      nomeCompleto: 'Ana Silva',
      page: 1,
      pageSize: 20,
    });

    expect(result).toEqual(mockResponseData);
  });

  it('deve propagar erro da API', async () => {
    const error = new Error('Erro na requisição');

    vi.mocked(api.get).mockRejectedValue(error);

    await expect(
      getExams({
        nomeCompleto: 'Ana',
      })
    ).rejects.toThrow('Erro na requisição');
  });

  it('não deve incluir page quando page for 0', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true },
    });

    await getExams({ page: 0, pageSize: 10 });

    expect(api.get).toHaveBeenCalledWith('/api/exams?pageSize=10');
  });

  it('não deve incluir pageSize quando pageSize for 0', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true },
    });

    await getExams({ page: 1, pageSize: 0 });

    expect(api.get).toHaveBeenCalledWith('/api/exams?page=1');
  });
});
