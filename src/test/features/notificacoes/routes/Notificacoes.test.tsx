// src/test/features/notificacoes/routes/Notificacoes.test.tsx
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Notificacoes from '@/features/notificacoes/routes/Notificacoes';
import { useSession } from '@/lib/auth-client';
import { useListNotifications } from '@/features/notificacoes/hooks/useListNotifications';
import { useMarkNotificationAsRead } from '@/features/notificacoes/hooks/useMarkNotificationAsRead';
import { useDeleteNotification } from '@/features/notificacoes/hooks/useDeleteNotification';

// ==========================================
// INFRAESTRUTURA DE MOCKS EXTRÍNSECOS (API & SESSÃO)
// ==========================================
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

// ==========================================
// SUBCOMPONENTES INTEGRANTES DO DASHBOARD (STUBS)
// ==========================================

vi.mock('@/features/notificacoes/components/SolicitacoesMedico', () => ({
  __esModule: true,
  default: () => <div data-testid="solicitacoes-medico">Mock Medico</div>,
}));

vi.mock('@/features/notificacoes/components/SolicitacoesAdmin', () => ({
  __esModule: true,
  default: ({ filters }: { filters: any }) => (
    <div data-testid="solicitacoes-admin" data-filters={JSON.stringify(filters)}>
      Mock Admin
    </div>
  ),
}));

vi.mock('@/features/notificacoes/components/CadastrosAdmin', () => ({
  __esModule: true,
  default: () => <div data-testid="cadastros-admin">Mock Cadastros Admin</div>,
}));

// Mock simples para os seletores do Radix UI / Shadcn funcionar em ambiente de teste JSDOM
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} data-testid="mock-select">
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
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

  // Injeção de dependência estrita do Context Provider do React Query
  const renderWithProviders = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <Notificacoes />
      </QueryClientProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();

    // Congela a linha do tempo (timeline) para validação determinística de regras de 24h
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-05-23T20:00:00.000Z').getTime()
    );

    // Isola instâncias de cache entre as execuções de testes
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false },
      },
    });

    // Estado inicial padrão estável do ambiente (Pre-sets)
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


  // CENÁRIOS DE RENDERIZAÇÃO E ESTADOS VISUAIS (UI)
 

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
    // Arrange
    vi.mocked(useListNotifications).mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
    } as any);

    // Act
    renderWithProviders();

    // Assert
    expect(screen.getAllByTestId('notification-skeleton')).toHaveLength(3);
  });


  // REGRAS DE NEGÓCIO E ORDENAÇÃO DE DADOS


  it('deve renderizar notificações ordenadas da mais nova para a mais antiga', () => {
    // Arrange
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

    // Act
    renderWithProviders();

    // Assert (Validação estrutural de indexação de array na árvore do DOM)
    const cards = screen.getAllByTestId(/notification-card-/);
    expect(within(cards[0]).getByText('Nova')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Antiga')).toBeInTheDocument();
  });

  it('deve exibir contador de não lidas na aba de filtro', () => {
    // Arrange
    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        { id: '1', tipo: 'avaliacao_ia_atualizada', titulo: 'N1', mensagem: 'M1', dados: null, lidaEm: null, createdAt: '2026-05-23T18:00:00.000Z' },
        { id: '2', tipo: 'avaliacao_ia_atualizada', titulo: 'N2', mensagem: 'M2', dados: null, lidaEm: '2026-05-23T18:10:00.000Z', createdAt: '2026-05-23T17:00:00.000Z' },
        { id: '3', tipo: 'avaliacao_ia_atualizada', titulo: 'N3', mensagem: 'M3', dados: null, lidaEm: null, createdAt: '2026-05-23T16:00:00.000Z' },
      ],
      isLoading: false,
      isFetching: false,
    } as any);

    // Act
    renderWithProviders();

    // Assert
    expect(
      screen.getByRole('tab', { name: /não lidas \(2\)/i })
    ).toBeInTheDocument();
  });

  // COMPORTAMENTO DAS ABAS E FILTROS DINÂMICOS

  it('deve chamar useListNotifications com status nao-lidas ao trocar filtro', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useListNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('tab', { name: /não lidas/i }));

    // Assert (Verifica se os parâmetros corretos foram injetados no endpoint/hook)
    const calls = vi.mocked(useListNotifications).mock.calls;
    const lastCall = calls[calls.length - 1]?.[0];
    expect(lastCall).toEqual({
      status: 'nao-lidas',
      limit: 50,
    });
  });

  it('deve filtrar notificações novas das últimas 24 horas ao trocar para a aba novas', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        { id: '1', tipo: 'avaliacao_ia_atualizada', titulo: 'Recente', mensagem: 'Dentro de 24h', dados: null, lidaEm: null, createdAt: '2026-05-23T10:00:00.000Z' },
        { id: '2', tipo: 'avaliacao_ia_atualizada', titulo: 'Antiga', mensagem: 'Fora de 24h', dados: null, lidaEm: null, createdAt: '2026-05-21T10:00:00.000Z' },
      ],
      isLoading: false,
      isFetching: false,
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('tab', { name: /novas/i }));

    // Assert
    expect(screen.getByText('Recente')).toBeInTheDocument();
    expect(screen.queryByText('Antiga')).not.toBeInTheDocument();
  });


  // DISPAROS DE MUTAÇÕES (AÇÕES DO USUÁRIO)


  it('deve chamar markAsRead ao clicar em marcar como lida de um card', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useListNotifications).mockReturnValue({
      data: [{ id: '1', tipo: 'avaliacao_ia_atualizada', titulo: 'Notif', mensagem: 'Mensagem', dados: null, lidaEm: null, createdAt: '2026-05-23T10:00:00.000Z' }],
      isLoading: false,
      isFetching: false,
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('button', { name: /marcar-1/i }));

    // Assert
    expect(markAsReadMock).toHaveBeenCalledWith('1');
  });

  it('deve chamar removeNotification ao clicar em remover de um card', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useListNotifications).mockReturnValue({
      data: [{ id: '1', tipo: 'avaliacao_ia_atualizada', titulo: 'Notif', mensagem: 'Mensagem', dados: null, lidaEm: null, createdAt: '2026-05-23T10:00:00.000Z' }],
      isLoading: false,
      isFetching: false,
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('button', { name: /remover-1/i }));

    // Assert
    expect(removeNotificationMock).toHaveBeenCalledWith('1');
  });

 
  // OPERAÇÕES EM LOTE (BATCH ACTIONS) & ESTADOS DE BOTÕES
 

  it('deve marcar todas como lidas ao clicar no botão', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useListNotifications).mockReturnValue({
      data: [
        { id: '1', tipo: 'avaliacao_ia_atualizada', titulo: 'N1', mensagem: 'M1', dados: null, lidaEm: null, createdAt: '2026-05-23T18:00:00.000Z' },
        { id: '2', tipo: 'avaliacao_ia_atualizada', titulo: 'N2', mensagem: 'M2', dados: null, lidaEm: '2026-05-23T18:10:00.000Z', createdAt: '2026-05-23T17:00:00.000Z' },
        { id: '3', tipo: 'avaliacao_ia_atualizada', titulo: 'N3', mensagem: 'M3', dados: null, lidaEm: null, createdAt: '2026-05-23T16:00:00.000Z' },
      ],
      isLoading: false,
      isFetching: false,
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('button', { name: /marcar todas como lidas/i }));

    // Assert (Apenas os IDs não lidos '1' e '3' devem ser enviados para a mutação)
    expect(markAsReadMock).toHaveBeenCalledTimes(2);
    expect(markAsReadMock).toHaveBeenNthCalledWith(1, '1');
    expect(markAsReadMock).toHaveBeenNthCalledWith(2, '3');
  });

  it('deve desabilitar o botão de marcar todas quando não houver não lidas', () => {
    // Arrange
    vi.mocked(useListNotifications).mockReturnValue({
      data: [{ id: '1', tipo: 'avaliacao_ia_atualizada', titulo: 'Lida', mensagem: 'Mensagem', dados: null, lidaEm: '2026-05-23T18:10:00.000Z', createdAt: '2026-05-23T17:00:00.000Z' }],
      isLoading: false,
      isFetching: false,
    } as any);

    // Act
    renderWithProviders();

    // Assert
    expect(screen.getByRole('button', { name: /marcar todas como lidas/i })).toBeDisabled();
  });

  it('deve desabilitar o botão de marcar todas quando estiver marcando', () => {
    // Arrange
    vi.mocked(useMarkNotificationAsRead).mockReturnValue({
      mutate: markAsReadMock,
      isPending: true,
    } as any);
    vi.mocked(useListNotifications).mockReturnValue({
      data: [{ id: '1', tipo: 'avaliacao_ia_atualizada', titulo: 'N1', mensagem: 'M1', dados: null, lidaEm: null, createdAt: '2026-05-23T18:00:00.000Z' }],
      isLoading: false,
      isFetching: false,
    } as any);

    // Act
    renderWithProviders();

    // Assert
    expect(screen.getByRole('button', { name: /marcar todas como lidas/i })).toBeDisabled();
  });

  // INDICADORES DE BACKGROUND RE-FETCHING E FEEDBACKS


  it('deve exibir mensagem de atualização quando estiver fetching', () => {
    // Arrange
    vi.mocked(useListNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: true,
    } as any);

    // Act
    renderWithProviders();

    // Assert
    expect(screen.getByText(/atualizando notificações/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de prevenção de concorrência ao deletar', () => {
    // Arrange
    vi.mocked(useDeleteNotification).mockReturnValue({
      mutate: removeNotificationMock,
      isPending: true,
    } as any);

    // Act
    renderWithProviders();

    // Assert
    expect(screen.getByText(/removendo notificação/i)).toBeInTheDocument();
  });

  // CONTROLE DE VISIBILIDADE POR CONTROLE DE ACESSO (RBAC)
  
  it('deve exibir solicitações do médico ao trocar de aba', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { tipoPerfil: 'MEDICO' } },
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('tab', { name: /solicitações/i }));

    // Assert
    expect(screen.getByTestId('solicitacoes-medico')).toBeInTheDocument();
  });

  it('deve exibir solicitações do admin ao trocar de aba', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { tipoPerfil: 'ADMIN' } },
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('tab', { name: /solicitações/i }));

    // Assert
    expect(screen.getByTestId('solicitacoes-admin')).toBeInTheDocument();
  });

  it('não deve exibir componente de solicitações para perfil desconhecido', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { tipoPerfil: 'PACIENTE' } },
    } as any);
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('tab', { name: /solicitações/i }));

    // Assert
    expect(screen.queryByTestId('solicitacoes-medico')).not.toBeInTheDocument();
    expect(screen.queryByTestId('solicitacoes-admin')).not.toBeInTheDocument();
  });

  // ==========================================
  // CENÁRIOS DOS NOVOS FILTROS DO PAINEL ADMIN
  // ==========================================

  describe('Filtros e Ordenação do Painel Admin', () => {
    beforeEach(() => {
      // Força a sessão como ADMIN para expor a barra de busca e selects
      vi.mocked(useSession).mockReturnValue({
        data: { user: { tipoPerfil: 'ADMIN' } },
      } as any);
    });

    it('deve repassar filtros vazios por padrão ao carregar a aba de solicitações', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      // Ativa a aba de solicitações
      await user.click(screen.getByRole('tab', { name: /solicitações/i }));

      const adminComponent = screen.getByTestId('solicitacoes-admin');
      const passedFilters = JSON.parse(adminComponent.getAttribute('data-filters') || '{}');

      // Por padrão, ordenação inicial deve ser mapeada corretamente da string "createdAt-desc"
      expect(passedFilters).toEqual({
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });

    it('deve aplicar filtro de nome quando um texto simples for digitado na busca livre', async () => {
      const user = userEvent.setup();
      renderWithProviders();
      await user.click(screen.getByRole('tab', { name: /solicitações/i }));

      const inputBusca = screen.getByPlaceholderText(/buscar por nome ou e-mail/i);
      await user.type(inputBusca, 'Gustavo Quaresma');

      const adminComponent = screen.getByTestId('solicitacoes-admin');
      const passedFilters = JSON.parse(adminComponent.getAttribute('data-filters') || '{}');

      // O texto simples deve cair na propriedade 'nome'
      expect(passedFilters.nome).toBe('Gustavo Quaresma');
      expect(passedFilters.email).toBeUndefined();
    });

    it('deve aplicar filtro de email de forma inteligente quando um padrão de email for digitado', async () => {
      const user = userEvent.setup();
      renderWithProviders();
      await user.click(screen.getByRole('tab', { name: /solicitações/i }));

      const inputBusca = screen.getByPlaceholderText(/buscar por nome ou e-mail/i);
      await user.type(inputBusca, 'cecilia@gmail.com');

      const adminComponent = screen.getByTestId('solicitacoes-admin');
      const passedFilters = JSON.parse(adminComponent.getAttribute('data-filters') || '{}');

      // O caractere @ dispara o mapeamento para a propriedade 'email'
      expect(passedFilters.email).toBe('cecilia@gmail.com');
      expect(passedFilters.nome).toBeUndefined();
    });

    it('deve repassar a propriedade de status correta ao mudar o select de status', async () => {
      const user = userEvent.setup();
      renderWithProviders();
      await user.click(screen.getByRole('tab', { name: /solicitações/i }));

      // Captura o select de status (o primeiro select renderizado na área do Admin)
      const selectStatus = screen.getAllByRole('combobox')[0];
      await user.selectOptions(selectStatus, 'PENDENTE');

      const adminComponent = screen.getByTestId('solicitacoes-admin');
      const passedFilters = JSON.parse(adminComponent.getAttribute('data-filters') || '{}');

      expect(passedFilters.status).toBe('PENDENTE');
    });

    it('deve quebrar a string de ordenação e passar sortBy e sortOrder separados', async () => {
      const user = userEvent.setup();
      renderWithProviders();
      await user.click(screen.getByRole('tab', { name: /solicitações/i }));

      // Captura o segundo select (Ordenação)
      const selectOrdem = screen.getAllByRole('combobox')[1];
      // Valor mapeado para: Nome (A-Z) -> "nomeCompleto-asc"
      await user.selectOptions(selectOrdem, 'nomeCompleto-asc');

      const adminComponent = screen.getByTestId('solicitacoes-admin');
      const passedFilters = JSON.parse(adminComponent.getAttribute('data-filters') || '{}');

      expect(passedFilters.sortBy).toBe('nomeCompleto');
      expect(passedFilters.sortOrder).toBe('asc');
    });
  });
  
});