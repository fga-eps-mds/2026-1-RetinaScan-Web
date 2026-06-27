import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import {
  searchMedicosApi,
  generateShareLinkApi,
  getExamSharesApi,
  revokeShareApi,
} from '@/features/historico-exames/api/shareExam';

vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('shareExam API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchMedicosApi', () => {
    it('deve chamar a API com a query correta e retornar a lista de médicos', async () => {
      const mockData = [
        { id: '1', nomeCompleto: 'Dr. Teste', email: 'teste@teste.com', crm: '123' },
      ];
      
      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await searchMedicosApi('Dr');

      expect(api.get).toHaveBeenCalledWith('/api/medicos/disponiveis', {
        params: { busca: 'Dr' },
      });
      expect(result).toEqual(mockData);
    });

    it('deve retornar um array vazio sem chamar a API se o termo de busca for vazio', async () => {
      const result = await searchMedicosApi('');

      expect(result).toEqual([]);
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('generateShareLinkApi', () => {
    it('deve fazer POST para a rota correta e retornar os dados gerados', async () => {
      const mockResponse = { message: 'Sucesso', data: { id: 'share-123' } };
      
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const payload = { emailDestino: 'teste@teste.com', expiraEm: '2026-12-31T23:59:00.000Z' };
      const result = await generateShareLinkApi('exam-123', payload);

      expect(api.post).toHaveBeenCalledWith('/api/exams/exam-123/share', payload);
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro customizado quando o status da resposta for 409 (Conflito)', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: { status: 409 },
      });

      await expect(
        generateShareLinkApi('exam-123', { emailDestino: 'teste@teste.com', expiraEm: null })
      ).rejects.toThrow('Este profissional já possui acesso a este exame. Use a lista abaixo para copiar o link.');
    });

    it('deve propagar erro padrão da API quando houver outras falhas', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Erro de validação no servidor' } },
      });

      await expect(
        generateShareLinkApi('exam-123', { emailDestino: 'teste@teste.com', expiraEm: null })
      ).rejects.toThrow('Erro de validação no servidor');
    });

    it('deve lançar erro se o ID do exame for indefinido', async () => {
      await expect(
        generateShareLinkApi(undefined, { emailDestino: 'teste@teste.com', expiraEm: null })
      ).rejects.toThrow('ID do exame inválido');
    });
  });

  describe('getExamSharesApi', () => {
    it('deve retornar os dados extraídos quando a resposta tiver o objeto aninhado em data.data', async () => {
      const mockShares = [{ id: '1', medicoDestino: { nomeCompleto: 'Dr. Teste' } }];
      
      vi.mocked(api.get).mockResolvedValue({
        data: { data: mockShares },
      });

      const result = await getExamSharesApi('exam-123');

      expect(api.get).toHaveBeenCalledWith('/api/exams/exam-123/shares');
      expect(result).toEqual(mockShares);
    });

    it('deve retornar um array vazio se a resposta não for um array válido', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true }, // Objeto inesperado no lugar de array
      });

      const result = await getExamSharesApi('exam-123');
      expect(result).toEqual([]);
    });
  });

  describe('revokeShareApi', () => {
    it('deve chamar o DELETE na rota correta combinando examId e shareId', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

      await revokeShareApi('exam-123', 'share-456');

      expect(api.delete).toHaveBeenCalledWith('/api/exams/exam-123/shares/share-456');
    });
  });
});