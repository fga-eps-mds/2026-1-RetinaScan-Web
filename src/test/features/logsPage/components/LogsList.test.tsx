import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogsList } from '@/features/logsPage/components/LogsList';
import { useGetLogs } from '@/features/logsPage/hooks/useGetLogs';

vi.mock('@/features/logsPage/hooks/useGetLogs', () => ({
  useGetLogs: vi.fn(),
}));

vi.mock('@/features/historico-exames/hooks/useDebounce', () => ({
  useDebouncedValue: (value: unknown) => value,
}));

vi.mock('@/features/logsPage/components/LogCard', () => ({
  LogCard: ({ log, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {log.description}
    </button>
  ),
}));

vi.mock('@/features/logsPage/components/LogModal', () => ({
  default: ({ isOpen, log }: any) =>
    isOpen ? <div>MODAL::{log?.description}</div> : null,
}));

describe('LogsList', () => {

  const mockLogs = [
    {
      id: '1',
      action: 'APPROVE',
      category: 'USER_MANAGEMENT',
      description: 'Solicitação aprovada',
      actorName: 'Administrador',
      actorEmail: 'admin@retinascan.local',
      targetEntityType: 'SOLICITATION',
      targetEntityId: 'target-1',
      targetDisplay: 'target-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      requestId: 'req-1',
      changes: { approved: true },
      metadata: { method: 'PATCH' },
      createdAt: '2026-05-31T20:04:56.662Z',
    },
    {
      id: '2',
      action: 'REJECT',
      category: 'USER_MANAGEMENT',
      description: 'Solicitação rejeitada',
      actorName: 'Moderador',
      actorEmail: 'mod@retinascan.local',
      targetEntityType: 'SOLICITATION',
      targetEntityId: 'target-2',
      targetDisplay: 'target-2',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      requestId: 'req-2',
      changes: { approved: false },
      metadata: { method: 'PATCH' },
      createdAt: '2026-05-30T20:04:56.662Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGetLogs).mockReturnValue({
      data: {
        data: mockLogs,
        total: 2,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);
  });

  it('deve renderizar os filtros, paginação e abrir o modal ao clicar no card', async () => {
    render(<LogsList />);

    expect(screen.getByPlaceholderText(/buscar usuário ou email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/filtrar ação/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /ordenar por ação/i })).toBeInTheDocument();

    expect(screen.getByText('Solicitação aprovada')).toBeInTheDocument();
    expect(screen.getByText('Solicitação rejeitada')).toBeInTheDocument();
    expect(screen.getByText(/página 1 de 1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Solicitação aprovada' }));

    await waitFor(() => {
      expect(screen.getByText('MODAL::Solicitação aprovada')).toBeInTheDocument();
    });
  });

  it('deve chamar a query com paginação padrão', () => {
    render(<LogsList />);

    expect(useGetLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 20,
      }),
    );
  });

  it('deve mostrar estados de loading e erro', () => {
    vi.mocked(useGetLogs).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: false,
    } as any);

    const { rerender } = render(<LogsList />);
    expect(screen.getByText(/carregando logs/i)).toBeInTheDocument();

    vi.mocked(useGetLogs).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
    } as any);

    rerender(<LogsList />);

    expect(screen.getByText(/erro ao carregar logs/i)).toBeInTheDocument();
  });
});
