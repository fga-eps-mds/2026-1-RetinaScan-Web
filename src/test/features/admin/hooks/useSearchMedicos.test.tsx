import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchMedicos } from '@/features/admin/hooks/useSearchMedicos';
import { searchMedicos } from '@/features/admin/api/searchMedicos';

// Mock estrito da API do admin
vi.mock('@/features/admin/api/searchMedicos', () => ({
  searchMedicos: vi.fn(),
}));

describe('useSearchMedicos Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('deve chamar searchMedicos com os filtros fornecidos e retornar os dados com sucesso', async () => {
    const mockData = {
      message: 'Sucesso',
      data: [{ id: '1', nomeCompleto: 'Dr. House' }],
    };
    
    vi.mocked(searchMedicos).mockResolvedValueOnce(mockData);

    const filters = { nome: 'House' };

    // Injeta o QueryClientProvider usando uma função anônima direta no wrapper, blindando o JSX
    const { result } = renderHook(() => useSearchMedicos(filters), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    // Aguarda a resolução assíncrona da query do TanStack Query
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Validações de contrato e chamada
    expect(searchMedicos).toHaveBeenCalledWith(filters);
    expect(result.current.data).toEqual(mockData);
  });
});