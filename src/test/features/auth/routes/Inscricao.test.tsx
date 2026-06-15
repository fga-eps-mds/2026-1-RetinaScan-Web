import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import Inscricao from '@/features/auth/routes/Inscricao';

const mocks = vi.hoisted(() => ({
  validationData: null as null | {
    email: string;
    nomeCompleto: string | null;
    tipoPerfil: 'MEDICO' | 'ESPECIALISTA' | null;
    tokenExpiresAt: string;
  },
  validationError: null as Error | null,
  submitMutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useValidateInscricaoToken', () => ({
  useValidateInscricaoToken: () => ({
    data: mocks.validationData,
    error: mocks.validationError,
    isLoading: false,
    isError: !!mocks.validationError,
  }),
}));

vi.mock('@/features/auth/hooks/useSubmitInscricao', () => ({
  useSubmitInscricao: () => ({
    mutateAsync: mocks.submitMutateAsync,
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
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
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

function renderPage(initialEntry = '/inscricao/token-123') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/inscricao/:token" element={<Inscricao />} />
        <Route path="/login" element={<div>Tela de login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Inscricao', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validationData = null;
    mocks.validationError = null;
  });

  it('mostra erro quando o token é inválido', () => {
    mocks.validationError = new Error('Token inválido ou expirado');

    renderPage();

    expect(screen.getByText(/link de inscrição inválido/i)).toBeInTheDocument();
    expect(screen.getByText(/token inválido ou expirado/i)).toBeInTheDocument();
  });

  it('carrega os dados do convite e envia a inscrição', async () => {
    const user = userEvent.setup();

    mocks.validationData = {
      email: 'medico@retinascan.com',
      nomeCompleto: 'Dra. Ana',
      tipoPerfil: 'MEDICO',
      tokenExpiresAt: '2026-06-20T10:00:00.000Z',
    };

    mocks.submitMutateAsync.mockResolvedValueOnce({
      message: 'Inscrição recebida com sucesso.',
    });

    renderPage();

    expect(await screen.findByText(/medico@retinascan.com/i)).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText(/digite seu nome completo/i));
    await user.type(screen.getByPlaceholderText(/digite seu nome completo/i), 'Dra. Ana Silva');
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678900');
    await user.type(screen.getByPlaceholderText(/000000\/UF/i), '123456/DF');
    await user.type(screen.getByPlaceholderText(/yyyy-mm-dd/i), '1990-01-01');
    await user.type(screen.getByPlaceholderText(/digite sua senha/i), 'senha1234');
    await user.type(screen.getByPlaceholderText(/repita sua senha/i), 'senha1234');
    await user.click(screen.getByRole('button', { name: /finalizar inscrição/i }));

    await waitFor(() => {
      expect(mocks.submitMutateAsync).toHaveBeenCalledWith({
        token: 'token-123',
        nomeCompleto: 'Dra. Ana Silva',
        cpf: '12345678900',
        crm: '123456/DF',
        dtNascimento: '1990-01-01',
        senha: 'senha1234',
      });
    });

    expect(await screen.findByText(/inscrição enviada/i)).toBeInTheDocument();
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      'Sua inscrição foi recebida com sucesso.',
    );
  });
});