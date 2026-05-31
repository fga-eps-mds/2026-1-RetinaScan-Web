import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import PasswordReset from '@/features/auth/routes/PasswordReset';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/features/auth/hooks/usePasswordReset', () => ({
  useResetPassword: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }

    return <button {...props}>{children}</button>;
  },
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

function renderPage(initialEntry = '/reset-password?token=token-123') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/login" element={<div>Tela de login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra erro quando token está ausente', () => {
    renderPage('/reset-password');

    expect(screen.getByText(/link inválido ou expirado/i)).toBeInTheDocument();
  });

  it('mostra erro quando senha tem menos de 8 caracteres', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByPlaceholderText(/digite sua nova senha/i),
      '123456'
    );

    expect(
      screen.getByText(/a senha deve ter pelo menos 8 caracteres/i)
    ).toBeInTheDocument();
  });

  it('mostra erro quando as senhas não coincidem', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByPlaceholderText(/digite sua nova senha/i),
      '12345678'
    );
    await user.type(
      screen.getByPlaceholderText(/confirme sua nova senha/i),
      '87654321'
    );

    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
  });

  it('envia token e nova senha corretamente', async () => {
    const user = userEvent.setup();
    mocks.mutateAsync.mockResolvedValue({
      success: true,
      message: 'Senha redefinida com sucesso',
    });

    renderPage('/reset-password?token=meu-token');

    await user.type(
      screen.getByPlaceholderText(/digite sua nova senha/i),
      '12345678'
    );
    await user.type(
      screen.getByPlaceholderText(/confirme sua nova senha/i),
      '12345678'
    );
    await user.click(screen.getByRole('button', { name: /redefinir senha/i }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        token: 'meu-token',
        newPassword: '12345678',
      });
    });
  });

  it('mostra tela de sucesso após redefinir senha', async () => {
    const user = userEvent.setup();
    mocks.mutateAsync.mockResolvedValue({
      success: true,
    });

    renderPage();

    await user.type(
      screen.getByPlaceholderText(/digite sua nova senha/i),
      '12345678'
    );
    await user.type(
      screen.getByPlaceholderText(/confirme sua nova senha/i),
      '12345678'
    );
    await user.click(screen.getByRole('button', { name: /redefinir senha/i }));

    expect(await screen.findByText(/senha redefinida/i)).toBeInTheDocument();

    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      'Senha redefinida com sucesso.'
    );
  });

  it('mostra erro retornado pela mutation', async () => {
    const user = userEvent.setup();
    mocks.mutateAsync.mockRejectedValue(
      new Error('Token inválido ou expirado')
    );

    renderPage();

    await user.type(
      screen.getByPlaceholderText(/digite sua nova senha/i),
      '12345678'
    );
    await user.type(
      screen.getByPlaceholderText(/confirme sua nova senha/i),
      '12345678'
    );
    await user.click(screen.getByRole('button', { name: /redefinir senha/i }));

    expect(
      await screen.findByText(/token inválido ou expirado/i)
    ).toBeInTheDocument();

    expect(mocks.toastError).toHaveBeenCalledWith('Token inválido ou expirado');
  });

  it('mostra erro genérico quando a mutation rejeita algo que não é Error', async () => {
    const user = userEvent.setup();
    mocks.mutateAsync.mockRejectedValue('falha desconhecida');

    renderPage();

    await user.type(
      screen.getByPlaceholderText(/digite sua nova senha/i),
      '12345678'
    );
    await user.type(
      screen.getByPlaceholderText(/confirme sua nova senha/i),
      '12345678'
    );
    await user.click(screen.getByRole('button', { name: /redefinir senha/i }));

    expect(
      await screen.findByText(/erro inesperado ao redefinir a senha/i)
    ).toBeInTheDocument();

    expect(mocks.toastError).toHaveBeenCalledWith(
      'Erro inesperado ao redefinir a senha.'
    );
  });
});
