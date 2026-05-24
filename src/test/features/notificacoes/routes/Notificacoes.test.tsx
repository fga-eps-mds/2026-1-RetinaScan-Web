// src/test/features/notificacoes/routes/Notificacoes.test.tsx
import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Notificacoes from '@/features/notificacoes/routes/Notificacoes';
import { useSession } from '@/lib/auth-client';
import { useListNotifications } from '@/features/notificacoes/hooks/useListNotifications';
import { useMarkNotificationAsRead } from '@/features/notificacoes/hooks/useMarkNotificationAsRead';
import { useDeleteNotification } from '@/features/notificacoes/hooks/useDeleteNotification';

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/features/notificacoes/hooks/useListNotifications', () => ({
  useListNotifications: vi.fn(),
}));

vi.mock('@/features/notificacoes/hooks/useMarkNotificationAsRead', () => ({
  useMarkNotificationAsRead: vi.fn(),
}));

vi.mock('@/features/notificacoes/hooks/useDeleteNotification', () => ({
  useDeleteNotification: vi.fn(),
}));

vi.mock('@/features/notificacoes/components/SolicitacoesMedico', () => ({
  __esModule: true,
  default: () => <div data-testid="solicitacoes-medico">Mock Medico</div>,
}));

vi.mock('@/features/notificacoes/components/SolicitacoesAdmin', () => ({
  __esModule: true,
  default: () => <div data-testid="solicitacoes-admin">Mock Admin</div>,
}));

vi.mock('@/features/notificacoes/components/NotificationCardSkeleton', () => ({
  NotificationCardSkeleton: () => (
    <div data-testid="notification-skeleton">Loading card</div>
  ),
}));

vi.mock('@/features/notificacoes/components/NotificationCard', () => ({
  NotificationCard: ({
    id,
    title,
    description,
    unread,
    onMarkAsRead,
    onRemove,
  }: {
    id: string;
    title: string;
    description: string;
    unread?: boolean;
    onMarkAsRead?: (id: string) => void;
    onRemove?: (id: string) => void;
  }) => (
    <div data-testid={`notification-card-${id}`}>
      <span>{title}</span>
      <span>{description}</span>
      <span>{unread ? 'não lida' : 'lida'}</span>
      <button onClick={() => onMarkAsRead?.(id)}>marcar-{id}</button>
      <button onClick={() => onRemove?.(id)}>remover-{id}</button>
    </div>
  ),
}));

describe('Notificacoes Route', () => {
  let queryClient: QueryClient;

  const markAsReadMock = vi.fn();
  const removeNotificationMock = vi.fn();

  const renderWithProviders = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <Notificacoes />
      </QueryClientProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-05-23T20:00:00.000Z').getTime()
    );

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },
        mutations: {
          retry: false,
        },
      },
    });

    vi.mocked(useSession).mockReturnValue({
      data: { user: { tipoPerfil: 'MEDICO' } },
    } as any);

    vi.mocked(useMarkNotificationAsRead).mockReturnValue({
      mutate: markAsReadMock,
      isPending: false,
    } as any);

    vi.mocked(useDeleteNotification).mockReturnValue({
      mutate: removeNotificationMock,
      isPending: false,
    } as any);

    vi.mocked(useListNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    } as any);
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  it('deve renderizar a aba de alertas por padrão e estado vazio', () => {
    renderWithProviders();

    expect(screen.getByRole('tab', { name: /alertas/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText(/notificações/i)).toBeInTheDocument();
    expect(
      screen.getByText(/nenhuma notificação encontrada/i)
    ).toBeInTheDocument();
  });

  it('deve exibir skeletons quando estiver carregando', () => {
    vi.mocked(useListNotifications).mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
    } as any);

    renderWithProviders();

    expect(screen.getAllByTestId('notification-skeleton')).toHaveLength(3);
  });

  it('deve renderizar notificações ordenadas da mais nova para a mais antiga', () => {
    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Antiga',
          mensagem: 'Mensagem antiga',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-22T10:00:00.000Z',
        },
        {
          id: '2',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Nova',
          mensagem: 'Mensagem nova',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T19:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    const cards = screen.getAllByTestId(/notification-card-/);
    expect(within(cards[0]).getByText('Nova')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Antiga')).toBeInTheDocument();
  });

  it('deve exibir contador de não lidas na aba de filtro', () => {
    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'N1',
          mensagem: 'M1',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T18:00:00.000Z',
        },
        {
          id: '2',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'N2',
          mensagem: 'M2',
          dados: null,
          lidaEm: '2026-05-23T18:10:00.000Z',
          createdAt: '2026-05-23T17:00:00.000Z',
        },
        {
          id: '3',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'N3',
          mensagem: 'M3',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T16:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    expect(
      screen.getByRole('tab', { name: /não lidas \(2\)/i })
    ).toBeInTheDocument();
  });

  it('deve chamar useListNotifications com status nao-lidas ao trocar filtro', async () => {
    const user = userEvent.setup();

    vi.mocked(useListNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    await user.click(screen.getByRole('tab', { name: /não lidas/i }));

    const calls = vi.mocked(useListNotifications).mock.calls;
    const lastCall = calls[calls.length - 1]?.[0];

    expect(lastCall).toEqual({
      status: 'nao-lidas',
      limit: 50,
    });
  });

  it('deve filtrar notificações novas das últimas 24 horas ao trocar para a aba novas', async () => {
    const user = userEvent.setup();

    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Recente',
          mensagem: 'Dentro de 24h',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T10:00:00.000Z',
        },
        {
          id: '2',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Antiga',
          mensagem: 'Fora de 24h',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-21T10:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    await user.click(screen.getByRole('tab', { name: /novas/i }));

    expect(screen.getByText('Recente')).toBeInTheDocument();
    expect(screen.queryByText('Antiga')).not.toBeInTheDocument();
  });

  it('deve chamar markAsRead ao clicar em marcar como lida de um card', async () => {
    const user = userEvent.setup();

    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Notif',
          mensagem: 'Mensagem',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T10:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    await user.click(screen.getByRole('button', { name: /marcar-1/i }));

    expect(markAsReadMock).toHaveBeenCalledWith('1');
  });

  it('deve chamar removeNotification ao clicar em remover de um card', async () => {
    const user = userEvent.setup();

    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Notif',
          mensagem: 'Mensagem',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T10:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    await user.click(screen.getByRole('button', { name: /remover-1/i }));

    expect(removeNotificationMock).toHaveBeenCalledWith('1');
  });

  it('deve marcar todas como lidas ao clicar no botão', async () => {
    const user = userEvent.setup();

    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'N1',
          mensagem: 'M1',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T18:00:00.000Z',
        },
        {
          id: '2',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'N2',
          mensagem: 'M2',
          dados: null,
          lidaEm: '2026-05-23T18:10:00.000Z',
          createdAt: '2026-05-23T17:00:00.000Z',
        },
        {
          id: '3',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'N3',
          mensagem: 'M3',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T16:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    await user.click(
      screen.getByRole('button', { name: /marcar todas como lidas/i })
    );

    expect(markAsReadMock).toHaveBeenCalledTimes(2);
    expect(markAsReadMock).toHaveBeenNthCalledWith(1, '1');
    expect(markAsReadMock).toHaveBeenNthCalledWith(2, '3');
  });

  it('deve desabilitar o botão de marcar todas quando não houver não lidas', () => {
    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Lida',
          mensagem: 'Mensagem',
          dados: null,
          lidaEm: '2026-05-23T18:10:00.000Z',
          createdAt: '2026-05-23T17:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    expect(
      screen.getByRole('button', { name: /marcar todas como lidas/i })
    ).toBeDisabled();
  });

  it('deve desabilitar o botão de marcar todas quando estiver marcando', () => {
    vi.mocked(useMarkNotificationAsRead).mockReturnValue({
      mutate: markAsReadMock,
      isPending: true,
    } as any);

    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'N1',
          mensagem: 'M1',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T18:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    renderWithProviders();

    expect(
      screen.getByRole('button', { name: /marcar todas como lidas/i })
    ).toBeDisabled();
  });

  it('deve exibir mensagem de atualização quando estiver fetching', () => {
    vi.mocked(useListNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: true,
    } as any);

    renderWithProviders();

    expect(screen.getByText(/atualizando notificações/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de remoção quando estiver removendo', () => {
    vi.mocked(useDeleteNotification).mockReturnValue({
      mutate: removeNotificationMock,
      isPending: true,
    } as any);

    renderWithProviders();

    expect(screen.getByText(/removendo notificação/i)).toBeInTheDocument();
  });

  it('deve exibir solicitações do médico ao trocar de aba', async () => {
    const user = userEvent.setup();

    vi.mocked(useSession).mockReturnValue({
      data: { user: { tipoPerfil: 'MEDICO' } },
    } as any);

    renderWithProviders();

    await user.click(screen.getByRole('tab', { name: /solicitações/i }));

    expect(screen.getByTestId('solicitacoes-medico')).toBeInTheDocument();
  });

  it('deve exibir solicitações do admin ao trocar de aba', async () => {
    const user = userEvent.setup();

    vi.mocked(useSession).mockReturnValue({
      data: { user: { tipoPerfil: 'ADMIN' } },
    } as any);

    renderWithProviders();

    await user.click(screen.getByRole('tab', { name: /solicitações/i }));

    expect(screen.getByTestId('solicitacoes-admin')).toBeInTheDocument();
  });

  it('não deve exibir componente de solicitações para perfil desconhecido', async () => {
    const user = userEvent.setup();

    vi.mocked(useSession).mockReturnValue({
      data: { user: { tipoPerfil: 'PACIENTE' } },
    } as any);

    renderWithProviders();

    await user.click(screen.getByRole('tab', { name: /solicitações/i }));

    expect(screen.queryByTestId('solicitacoes-medico')).not.toBeInTheDocument();
    expect(screen.queryByTestId('solicitacoes-admin')).not.toBeInTheDocument();
  });
});
