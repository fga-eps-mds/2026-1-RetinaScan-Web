import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { createExam } from '@/features/exames/api/createExam';

vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('createExam', () => {
  const mockData = {
    nomeCompleto: 'Maria da Silva',
    cpf: '12345678901',
    sexo: 'FEMININO',
    dtNascimento: '1990-01-15',
    dtHora: '2026-04-24T12:00:00.000Z',
    comorbidades: 'Hipertensao',
    descricao: 'Visao turva',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a API com os parametros corretos e retornar os dados', async () => {
    const mockResponse = { data: { id: 'exam-1', ...mockData } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await createExam(mockData as any);

    expect(api.post).toHaveBeenCalledWith('/api/exams', mockData);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse.data);
  });

  it('deve propagar o erro quando a chamada da API falha', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Erro ao criar exame'));

    await expect(createExam(mockData as any)).rejects.toThrow(
      'Erro ao criar exame'
    );
  });
});
