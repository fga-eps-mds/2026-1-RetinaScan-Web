import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Notificacoes from '@/features/notificacoes/routes/Notificacoes';
import { useSession } from '@/lib/auth-client';

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}));

vi.mock('../../../../features/notificacoes/components/NotificacoesLista', () => ({
  NotificationsList: () => <div data-testid="notifications-list">Mock Lista</div>,
}));

vi.mock('../../../../features/notificacoes/components/SolicitacoesMedico', () => ({
  __esModule: true,
  default: () => <div data-testid="solicitacoes-medico">Mock Medico</div>,
}));

vi.mock('../../../../features/notificacoes/components/SolicitacoesAdmin', () => ({
  __esModule: true,
  default: () => <div data-testid="solicitacoes-admin">Mock Admin</div>,
}));

describe('Notificacoes Route', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve renderizar a aba de alertas e a lista de notificações por padrão', () => {
    (useSession as any).mockReturnValue({ 
      data: { user: { tipoPerfil: 'MEDICO' } } 
    });
    
    renderWithProviders(<Notificacoes />);

    expect(screen.getByText(/notificações/i)).toBeInTheDocument();
    expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
  });

  it('deve exibir o componente de solicitações do médico ao trocar de aba', async () => {
    const user = userEvent.setup();
    (useSession as any).mockReturnValue({ 
      data: { user: { tipoPerfil: 'MEDICO' } } 
    });

    renderWithProviders(<Notificacoes />);

    const tabSolicitacoes = screen.getByRole('tab', { name: /solicitações/i });
    await user.click(tabSolicitacoes);

    expect(await screen.findByTestId('solicitacoes-medico')).toBeInTheDocument();
  });

  it('deve exibir o componente de solicitações do admin ao trocar de aba', async () => {
    const user = userEvent.setup();
    (useSession as any).mockReturnValue({ 
      data: { user: { tipoPerfil: 'ADMIN' } } 
    });

    renderWithProviders(<Notificacoes />);

    const tabSolicitacoes = screen.getByRole('tab', { name: /solicitações/i });
    await user.click(tabSolicitacoes);

    expect(await screen.findByTestId('solicitacoes-admin')).toBeInTheDocument();
  });
});