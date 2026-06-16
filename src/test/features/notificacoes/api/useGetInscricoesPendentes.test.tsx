import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetInscricoesPendentes } from '@/features/notificacoes/hooks/useGetInscricoesPendentes';
import { 
  getInscricoesPendentes, 
  type InscricaoPendente 
} from '@/features/notificacoes/api/getInscricoesPendentes';

// Mock com o caminho idêntico ao do import
vi.mock('@/features/notificacoes/api/getInscricoesPendentes', () => ({
  getInscricoesPendentes: vi.fn(),
}));

describe('useGetInscricoesPendentes', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Desliga os retries automáticos para não atrasar o teste
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve retornar os dados da API com sucesso', async () => {
    // Arrange: MockData com a tipagem e dados completos
    const mockData: InscricaoPendente[] = [
      {
        id: 'INSC-001',
        email: 'medico@email.com',
        nomeCompleto: 'João Médico',
        cpf: '12345678900',
        crm: '12345-SP',
        dtNascimento: '1980-01-01',
        status: 'CONVITE_ENVIADO',
        submittedAt: '2026-06-14T10:00:00Z',
        createdAt: '2026-06-14T10:00:00Z',
        updatedAt: '2026-06-14T10:00:00Z',
      },
    ];
    
    // O TypeScript agora aceitará o mockData sem reclamar
    vi.mocked(getInscricoesPendentes).mockResolvedValue(mockData);

    // Act
    const { result } = renderHook(() => useGetInscricoesPendentes(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getInscricoesPendentes).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });

  it('deve repassar o estado de erro se a API falhar', async () => {
    // Arrange
    const mockError = new Error('Falha ao buscar dados');
    vi.mocked(getInscricoesPendentes).mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useGetInscricoesPendentes(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});