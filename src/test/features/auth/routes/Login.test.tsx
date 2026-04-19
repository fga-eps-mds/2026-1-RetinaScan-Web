import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '@/features/auth/routes/Login';

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  toast: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  signIn: {
    email: mocks.signInEmail,
  },
}));

vi.mock('sonner', () => ({
  toast: Object.assign(mocks.toast, {
    error: mocks.toastError,
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      id={id}
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os campos e botão de login', () => {
    render(<Login />);

    expect(screen.getByText(/entrar na plataforma/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/digite sua senha/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('envia o formulário com os dados corretos', async () => {
    const user = userEvent.setup();
    mocks.signInEmail.mockResolvedValue({ error: null });

    render(<Login />);

    await user.type(
      screen.getByPlaceholderText(/seu@email.com/i),
      'gustavo@email.com'
    );
    await user.type(screen.getByPlaceholderText(/digite sua senha/i), '123456');
    await user.click(screen.getByLabelText(/lembrar de mim/i));
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mocks.signInEmail).toHaveBeenCalledWith({
        email: 'gustavo@email.com',
        password: '123456',
        rememberMe: true,
        callbackURL: '/',
      });
    });
  });

  it('mostra erro quando a API retorna erro', async () => {
    const user = userEvent.setup();
    mocks.signInEmail.mockResolvedValue({
      error: { message: 'Credenciais inválidas' },
    });

    render(<Login />);

    await user.type(
      screen.getByPlaceholderText(/seu@email.com/i),
      'gustavo@email.com'
    );
    await user.type(
      screen.getByPlaceholderText(/digite sua senha/i),
      'senhaerrada'
    );
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(
      await screen.findByText(/credenciais inválidas/i)
    ).toBeInTheDocument();

    expect(mocks.toastError).toHaveBeenCalledWith('Credenciais inválidas', {
      description: 'Verifique suas credenciais e tente novamente.',
    });
  });

  it('mostra erro genérico quando ocorre exceção', async () => {
    const user = userEvent.setup();
    mocks.signInEmail.mockRejectedValue(new Error('network'));

    render(<Login />);

    await user.type(
      screen.getByPlaceholderText(/seu@email.com/i),
      'gustavo@email.com'
    );
    await user.type(screen.getByPlaceholderText(/digite sua senha/i), '123456');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(
      await screen.findByText(/erro inesperado ao fazer login/i)
    ).toBeInTheDocument();
  });
});
