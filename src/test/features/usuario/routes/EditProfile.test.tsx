import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditProfile from '@/features/usuario/routes/EditProfile';

const {
  mockMutate,
  mockUploadImage,
  mockRefetch,
  mockToastSuccess,
  mockToastError,
  mockCreateSolicitacao,
} = vi.hoisted(() => ({
  mockMutate: vi.fn(),
  mockUploadImage: vi.fn(),
  mockRefetch: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockCreateSolicitacao: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'Gustavo Costa',
        email: 'gustavo@email.com',
        dtNascimento: '1999-05-10',
        crm: '12345',
        cpf: '123.456.789-00',
        image: '',
      },
    },
    refetch: mockRefetch,
  }),
}));

vi.mock('@/features/usuario/hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock('@/features/usuario/hooks/useUpdateProfileImage', () => ({
  useUpdateProfileImage: () => ({
    mutateAsync: mockUploadImage,
  }),
}));

vi.mock('../hooks/useCreateSolicitacaoCpfCrm', () => ({
  useCreateSolicitacaoCpfCrm: () => ({
    mutateAsync: mockCreateSolicitacao,
    isPending: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarImage: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="mock-dialog">{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Camera: () => <svg data-testid="camera-icon" />,
  Eye: () => <svg />,
  EyeOff: () => <svg />,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('EditProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockResolvedValue({});
    mockUploadImage.mockResolvedValue({});
  });

  it('deve renderizar os dados básicos do usuário', () => {
    renderWithProviders(<EditProfile />);

    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Gustavo Costa')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('gustavo@email.com')
    ).toBeInTheDocument();
    expect(screen.getByText(/Data atual:/i)).toBeInTheDocument();
  });

  it('deve chamar onDirtyChange com false na renderização inicial e true ao alterar campos', async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();

    renderWithProviders(<EditProfile onDirtyChange={onDirtyChange} />);

    expect(onDirtyChange).toHaveBeenCalledWith(false);

    const nomeInput = screen.getByPlaceholderText('Gustavo Costa');
    await user.type(nomeInput, 'Novo Nome');

    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenCalledWith(true);
    });
  });

  it('deve enviar payload correto ao salvar nome e email', async () => {
    const user = userEvent.setup();

    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({});
    });

    renderWithProviders(<EditProfile />);

    await user.type(screen.getByPlaceholderText('Gustavo Costa'), 'Novo Nome');
    await user.type(
      screen.getByPlaceholderText('gustavo@email.com'),
      'novo@email.com'
    );

    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    const [payload] = mockMutate.mock.calls[0];

    expect(payload).toEqual({
      nomeCompleto: 'Novo Nome',
      email: 'novo@email.com',
    });

    expect(mockRefetch).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith('Perfil atualizado!');
  });

  it('deve enviar dtNascimento quando a data for alterada', async () => {
    const user = userEvent.setup();

    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({});
    });

    renderWithProviders(<EditProfile />);

    const dateInput = document.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();

    await user.type(dateInput, '2000-01-20');

    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    const [payload] = mockMutate.mock.calls[0];

    expect(payload).toEqual({
      dtNascimento: '2000-01-20',
    });
  });

  it('deve fazer upload de imagem quando um arquivo for selecionado', async () => {
    const user = userEvent.setup();

    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({});
    });

    renderWithProviders(<EditProfile />);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();

    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith(file);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Perfil atualizado!');
  });

  it('deve mostrar erro quando a mutation falhar', async () => {
    const user = userEvent.setup();

    mockMutate.mockImplementation((_payload, options) => {
      options?.onError?.(new Error('Email inválido\nSenha incorreta'));
    });

    renderWithProviders(<EditProfile />);

    await user.type(
      screen.getByPlaceholderText('gustavo@email.com'),
      'erro@email.com'
    );
    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledTimes(1);
    });

    expect(mockToastError).toHaveBeenCalledWith(
      'Erro ao atualizar perfil',
      expect.objectContaining({
        description: expect.anything(),
      })
    );
  });

  it('deve chamar onClose após salvar com sucesso', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({});
    });

    renderWithProviders(<EditProfile onClose={onClose} />);

    await user.type(screen.getByPlaceholderText('Gustavo Costa'), 'Novo Nome');
    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve desabilitar o botão salvar quando não houver alterações', () => {
    renderWithProviders(<EditProfile />);

    const button = screen.getByRole('button', { name: /atualizar/i });
    expect(button).toBeDisabled();
  });

  it('deve habilitar o botão salvar quando houver alterações', async () => {
    const user = userEvent.setup();

    renderWithProviders(<EditProfile />);

    const button = screen.getByRole('button', { name: /atualizar/i });
    const nomeInput = screen.getByPlaceholderText('Gustavo Costa');

    expect(button).toBeDisabled();

    await user.type(nomeInput, 'Novo Nome');

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});