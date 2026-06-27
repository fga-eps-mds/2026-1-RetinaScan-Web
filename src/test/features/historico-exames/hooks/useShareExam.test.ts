import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useSearchMedicos,
  useGenerateShareLink,
  useGetExamShares,
  useRevokeShare,
} from '@/features/historico-exames/hooks/useShareExam';

// 1. Importamos as funções DIRETAMENTE pelo nome
import { 
  searchMedicosApi, 
  generateShareLinkApi, 
  getExamSharesApi, 
  revokeShareApi 
} from '@/features/historico-exames/api/shareExam';

// 2. Mockamos as funções mantendo o mesmo caminho
vi.mock('@/features/historico-exames/api/shareExam', () => ({
  searchMedicosApi: vi.fn(),
  generateShareLinkApi: vi.fn(),
  getExamSharesApi: vi.fn(),
  revokeShareApi: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useShareExam Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSearchMedicos', () => {
    it('deve chamar a API e retornar os médicos quando ativado (enabled: true)', async () => {
      const mockMedicos = [{ id: '1', nomeCompleto: 'Dr. Teste', email: 'dr@teste.com', crm: '123' }];
      
      // 3. Usamos vi.mocked direto na função importada
      vi.mocked(searchMedicosApi).mockResolvedValue(mockMedicos);

      const { result } = renderHook(() => useSearchMedicos('Dr. Teste', true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(searchMedicosApi).toHaveBeenCalledWith('Dr. Teste');
      expect(result.current.data).toEqual(mockMedicos);
    });

    it('não deve disparar a consulta se desativado (enabled: false)', () => {
      renderHook(() => useSearchMedicos('Dr. Teste', false), {
        wrapper: createWrapper(),
      });

      expect(searchMedicosApi).not.toHaveBeenCalled();
    });
  });

  describe('useGenerateShareLink', () => {
    it('deve disparar a mutation de gerar link com sucesso', async () => {
      const mockResponse = { message: 'Sucesso', data: { id: 'share-123' } } as any;
      vi.mocked(generateShareLinkApi).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGenerateShareLink('exam-123'), {
        wrapper: createWrapper(),
      });

      const payload = { emailDestino: 'dr@teste.com', expiraEm: null };
      
      result.current.mutate(payload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(generateShareLinkApi).toHaveBeenCalledWith('exam-123', payload);
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useGetExamShares', () => {
    it('deve buscar e listar os compartilhamentos ativos de um exame', async () => {
      // mock com crm e email para o TypeScript não reclamar!
      const mockShares = [{ 
        id: 'share-1', 
        medicoDestino: { nomeCompleto: 'Dr. A', crm: '12345', email: 'dr.a@teste.com' }, 
        expiraEm: null, 
        criadoEm: '' 
      }];
      
      vi.mocked(getExamSharesApi).mockResolvedValue(mockShares);

      const { result } = renderHook(() => useGetExamShares('exam-123', true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(getExamSharesApi).toHaveBeenCalledWith('exam-123');
      expect(result.current.data).toEqual(mockShares);
    });
  });

  describe('useRevokeShare', () => {
    it('deve disparar a exclusão do compartilhamento via API', async () => {
      vi.mocked(revokeShareApi).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRevokeShare('exam-123'), {
        wrapper: createWrapper(),
      });

      result.current.mutate('share-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(revokeShareApi).toHaveBeenCalledWith('exam-123', 'share-123');
    });
  });
});