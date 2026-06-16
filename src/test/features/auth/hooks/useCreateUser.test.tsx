import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Importa o hook da pasta AUTH (para resolver o 0% de coverage que vimos)
import { useCreateUser } from '@/features/auth/hooks/useCreateUser';

// 2. Importa as dependências do ADMIN (porque é isso que o hook usa lá dentro)
import { createUser } from '@/features/admin/api/createUser';
import { adminKeys } from '@/features/admin/api/queryKeyrs';

// 3. Mocka exatamente o caminho do ADMIN
vi.mock('@/features/admin/api/createUser', () => ({
  createUser: vi.fn(),
}));

describe('useCreateUser', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve chamar a API e invalidar a query de usuários ao ter sucesso', async () => {
    const mockPayload = { 
      nome: 'Dr. João', 
      email: 'joao@email.com', 
      tipoPerfil: 'MEDICO' as const 
    };
    const mockResponse = { id: '123', ...mockPayload };

    vi.mocked(createUser).mockResolvedValue(mockResponse);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate(mockPayload as any);

    await waitFor(() => {
      // expect.anything() ignora os meta-dados injetados pelo React Query
      expect(createUser).toHaveBeenCalledWith(mockPayload, expect.anything());
      
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: adminKeys.users,
      });
    });
  });

  it('deve repassar o erro e NÃO invalidar a query se a chamada falhar', async () => {
    const mockPayload = { 
      nome: 'Dra. Maria', 
      email: 'maria@email.com', 
      tipoPerfil: 'ESPECIALISTA' as const 
    };
    const mockError = new Error('Erro ao criar usuário');
    
    vi.mocked(createUser).mockRejectedValue(mockError);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate(mockPayload as any);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
      
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    });
  });
});