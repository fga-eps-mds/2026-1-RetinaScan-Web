import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { useSession } from '@/lib/auth-client';
import { ProtectedRoute } from '@/app/providers/router/protected-route/ProtectedRoute';

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/components/layout/not-authorized/NotAuthorized', () => ({
  default: () => <div data-testid="not-authorized" />,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
  };
});

describe('ProtectedRoute', () => {
  const Child = () => <div data-testid="child">Conteúdo</div>;
  const roles = ['admin'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza loading quando isPending é true', () => {
    (useSession as any).mockReturnValue({ data: null, isPending: true });
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute allowed_roles={roles}>
          <Child />
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('redireciona para /login quando session é null', () => {
    (useSession as any).mockReturnValue({ data: null, isPending: false });
    render(
      <MemoryRouter>
        <ProtectedRoute allowed_roles={roles}>
          <Child />
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('navigate').getAttribute('data-to')).toBe(
      '/login'
    );
  });

  it('exibe NotAuthorized quando role é inválida', () => {
    (useSession as any).mockReturnValue({
      data: { user: { tipoPerfil: 'user' } },
      isPending: false,
    });
    render(
      <MemoryRouter>
        <ProtectedRoute allowed_roles={roles}>
          <Child />
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('not-authorized')).toBeTruthy();
  });

  it('renderiza children quando autorizado', () => {
    (useSession as any).mockReturnValue({
      data: { user: { tipoPerfil: 'admin' } },
      isPending: false,
    });
    render(
      <MemoryRouter>
        <ProtectedRoute allowed_roles={roles}>
          <Child />
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});
