import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Home } from '@/features/home/routes/Home'; // Ajustado para alias
import { authClient } from '@/lib/auth-client';

// 1. Mock do hook de sessão
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

// 2. Mock do Spinner (UI de carregamento)
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Carregando...</div>,
}));

// 3. Mocks com caminhos absolutos (@/features/...) para garantir a substituição correta
vi.mock('@/features/home/components/admin/AdminDashboard', () => ({
  AdminDashboard: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

vi.mock('@/features/home/components/medico/MedicoDashboard', () => ({
  MedicoDashboard: () => <div data-testid="medico-dashboard">Medico Dashboard</div>,
}));

vi.mock('@/features/home/components/especialista/EspecialistaDashboard', () => ({
  EspecialistaDashboard: () => <div data-testid="especialista-dashboard">Especialista Dashboard</div>,
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir o spinner enquanto a sessão estiver carregando (isPending: true)', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      isPending: true,
      data: null,
      error: null,
    } as any);

    render(<Home />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
  });

  it('deve renderizar o AdminDashboard se o tipoPerfil for ADMIN', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      isPending: false,
      data: { user: { tipoPerfil: 'ADMIN' } },
      error: null,
    } as any);

    render(<Home />);

    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('deve renderizar o MedicoDashboard se o tipoPerfil for MEDICO', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      isPending: false,
      data: { user: { tipoPerfil: 'MEDICO' } },
      error: null,
    } as any);

    render(<Home />);

    expect(screen.getByTestId('medico-dashboard')).toBeInTheDocument();
  });

  it('deve renderizar o EspecialistaDashboard se o tipoPerfil for ESPECIALISTA', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      isPending: false,
      data: { user: { tipoPerfil: 'ESPECIALISTA' } },
      error: null,
    } as any);

    render(<Home />);

    expect(screen.getByTestId('especialista-dashboard')).toBeInTheDocument();
  });

  it('deve exibir a tela de acesso não autorizado se o perfil não estiver mapeado', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      isPending: false,
      data: { user: { tipoPerfil: 'PACIENTE' } },
      error: null,
    } as any);

    render(<Home />);

    expect(screen.getByText('Acesso não autorizado.')).toBeInTheDocument();
    expect(screen.getByText(/O seu perfil \(PACIENTE\) não possui um painel configurado/i)).toBeInTheDocument();
  });

  it('deve exibir a tela de acesso não autorizado com fallback se o perfil for nulo ou ausente', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      isPending: false,
      data: { user: {} }, 
      error: null,
    } as any);

    render(<Home />);

    expect(screen.getByText('Acesso não autorizado.')).toBeInTheDocument();
    expect(screen.getByText(/O seu perfil \(Desconhecido\) não possui um painel configurado/i)).toBeInTheDocument();
  });
});