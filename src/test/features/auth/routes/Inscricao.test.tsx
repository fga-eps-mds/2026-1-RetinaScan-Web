import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Inscricao from '@/features/auth/routes/Inscricao';

const mocks = vi.hoisted(() => ({
  submitMutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useSelfCreateUser', () => ({
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

vi.mock('@/utils/formatters', () => ({
  formatCpf: (val: string) => val,
  formatCrm: (val: string) => val,
}));

describe('Inscricao', () => {
  let queryClient: QueryClient;

  function renderPage(initialEntry = '/inscricao?token=token-123') {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/inscricao" element={<Inscricao />} />
            <Route path="/login" element={<div>Tela de login</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  it('mostra erro de link inválido quando a URL não possuir token na querystring', () => {
    renderPage('/inscricao'); 

    expect(screen.getByText(/link de inscrição inválido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/o link recebido não contém o token necessário/i)
    ).toBeInTheDocument();
  });

  it('mostra erro e bloqueia envio se as senhas não coincidirem ao submeter', async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    await user.type(screen.getByPlaceholderText(/digite seu nome completo/i), 'Dra. Ana');
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678900'); 
    await user.type(screen.getByPlaceholderText(/000000\/UF/i), '123456DF');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await user.type(dateInput, '1990-01-01');

    await user.type(screen.getByPlaceholderText(/digite sua senha/i), 'senha123');
    await user.type(screen.getByPlaceholderText(/repita sua senha/i), 'senhaDIFERENTE');

    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /finalizar inscrição/i }));

    expect(mocks.submitMutateAsync).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith('As senhas não coincidem.');
  });

  it('envia a inscrição com os dados corretos e exibe a tela de sucesso', async () => {
    const user = userEvent.setup();
    mocks.submitMutateAsync.mockResolvedValueOnce({});

    const { container } = renderPage();

    await user.type(screen.getByPlaceholderText(/digite seu nome completo/i), 'Dra. Ana Silva');
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678900'); 
    await user.type(screen.getByPlaceholderText(/000000\/UF/i), '123456DF');

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await user.type(dateInput, '1990-01-01');

    await user.type(screen.getByPlaceholderText(/digite sua senha/i), 'senha1234');
    await user.type(screen.getByPlaceholderText(/repita sua senha/i), 'senha1234');
    
    await user.click(screen.getByRole('button', { name: /finalizar inscrição/i }));

    await waitFor(() => {
      expect(mocks.submitMutateAsync).toHaveBeenCalledWith({
        token: 'token-123',
        nomeCompleto: 'Dra. Ana Silva',
        cpf: '12345678900',
        crm: '123456DF',
        dtNascimento: '1990-01-01',
        senha: 'senha1234',
      });
    });

    expect(mocks.toastSuccess).toHaveBeenCalledWith('Sua inscrição foi recebida com sucesso.');
    expect(await screen.findByText(/inscrição enviada/i)).toBeInTheDocument();
  });

  it('deve formatar erro de API caso a requisição falhe', async () => {
    const user = userEvent.setup();
    const mockApiError = {
      response: { data: { message: 'CPF já cadastrado.' } }
    };
    mocks.submitMutateAsync.mockRejectedValueOnce(mockApiError);

    const { container } = renderPage();

    await user.type(screen.getByPlaceholderText(/digite seu nome completo/i), 'Dra. Ana');
    await user.type(screen.getByPlaceholderText(/000\.000\.000-00/i), '12345678900');
    await user.type(screen.getByPlaceholderText(/000000\/UF/i), '123456DF');
    
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await user.type(dateInput, '1990-01-01');

    await user.type(screen.getByPlaceholderText(/digite sua senha/i), 'senha123');
    await user.type(screen.getByPlaceholderText(/repita sua senha/i), 'senha123');

    await user.click(screen.getByRole('button', { name: /finalizar inscrição/i }));

    await waitFor(() => {
      expect(mocks.submitMutateAsync).toHaveBeenCalled();
    });

    expect(mocks.toastError).toHaveBeenCalled();
  });
});