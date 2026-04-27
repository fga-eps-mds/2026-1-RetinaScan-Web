import { fireEvent } from '@testing-library/react';
import React from 'react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  type Mock,
} from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import EditProfile from '@/features/usuario/routes/EditProfile';
import { useSession } from '@/lib/auth-client';

// 🚨 IMPORTANTE: Usando caminhos absolutos (@/...) para evitar o erro de 'undefined' no import
import { useUpdateProfile } from '@/features/usuario/hooks/useUpdateProfile';
import { useUpdateProfileImage } from '@/features/usuario/hooks/useUpdateProfileImage';
import { useCreateSolicitacaoCpfCrm } from '@/features/usuario/hooks/useCreateSolicitacaoCpfCrm';
import { toast } from 'sonner';
import { validateCPF } from '@/utils/validators';

// --- Mocks com caminhos correspondentes aos imports ---
vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/features/usuario/hooks/useUpdateProfile', () => ({
  useUpdateProfile: vi.fn(),
}));

vi.mock('@/features/usuario/hooks/useUpdateProfileImage', () => ({
  useUpdateProfileImage: vi.fn(),
}));

vi.mock('@/features/usuario/hooks/useCreateSolicitacaoCpfCrm', () => ({
  useCreateSolicitacaoCpfCrm: vi.fn(),
}));

vi.mock('@/utils/mappers/mapSolicitacaoErrors', () => ({
  mapSolicitacaoErrors: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/validators', () => ({
  validateCPF: vi.fn(),
}));

vi.mock('@/utils/formatters', () => ({
  formatCpf: (val: string) => val,
  formatCrm: (val: string) => val,
}));

vi.mock('@/utils/date', () => ({
  formatDateInput: () => '1990-01-01',
  formatDateLabel: () => '01/01/1990',
}));

vi.mock('@/utils/mappers/mapSolicitacaoErrors', () => ({
  mapSolicitacaoErrors: () => ({}),
}));

// Instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('Componente EditProfile', () => {
  const mockRefetch = vi.fn();
  const mockMutateProfile = vi.fn();
  const mockMutateImage = vi.fn();
  const mockCreateSolicitacao = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnDirtyChange = vi.fn();

  beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'mocked-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Usando casting direto para evitar o erro do vi.mocked
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'João Silva',
          email: 'joao@example.com',
          dtNascimento: '1990-01-01T00:00:00.000Z',
          crm: '123456/SP',
          cpf: '12345678900',
          image: 'http://example.com/avatar.jpg',
        },
      },
      refetch: mockRefetch,
    });

    (useUpdateProfile as Mock).mockReturnValue({
      mutate: mockMutateProfile,
      isPending: false,
    });

    (useUpdateProfileImage as Mock).mockReturnValue({
      mutateAsync: mockMutateImage,
    });

    (useCreateSolicitacaoCpfCrm as Mock).mockReturnValue({
      mutateAsync: mockCreateSolicitacao,
      isPending: false,
    });
  });

  it('deve renderizar os dados iniciais do usuário corretamente', () => {
    renderWithProviders(<EditProfile />);

    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('123456/SP')).toBeInTheDocument();
    expect(screen.getByText('12345678900')).toBeInTheDocument();
    expect(screen.getByText(/Data atual: 01\/01\/1990/)).toBeInTheDocument();
  });

  it('deve habilitar o botão de atualização e chamar onDirtyChange ao editar campos', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditProfile onDirtyChange={mockOnDirtyChange} />);

    const buttonAtualizar = screen.getByRole('button', { name: /Atualizar/i });
    expect(buttonAtualizar).toBeDisabled();

    const inputNome = screen.getByPlaceholderText('João Silva');
    await user.type(inputNome, 'Maria Souza');

    expect(mockOnDirtyChange).toHaveBeenCalledWith(true);
    expect(buttonAtualizar).toBeEnabled();
  });

  it('deve submeter o formulário corretamente ao editar o nome', async () => {
    const user = userEvent.setup();

    mockMutateProfile.mockImplementation((payload: any, options: any) => {
      options.onSuccess();
    });

    renderWithProviders(<EditProfile onClose={mockOnClose} />);

    const inputNome = screen.getByPlaceholderText('João Silva');
    await user.type(inputNome, 'Maria Silva');

    const buttonAtualizar = screen.getByRole('button', { name: /Atualizar/i });
    await user.click(buttonAtualizar);

    await waitFor(() => {
      expect(mockMutateProfile).toHaveBeenCalledWith(
        { nomeCompleto: 'Maria Silva' },
        expect.any(Object)
      );
      expect(mockRefetch).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Perfil atualizado!');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('deve alternar a visibilidade da senha', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditProfile />);

    const inputSenhaAtual = screen.getAllByPlaceholderText('••••••••••')[0];
    expect(inputSenhaAtual).toHaveAttribute('type', 'password');

    const botoesOlho = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg') !== null);
    await user.click(botoesOlho[1]);

    expect(inputSenhaAtual).toHaveAttribute('type', 'text');
  });

  it('deve abrir o modal de solicitação de CPF/CRM e enviar com sucesso', async () => {
    const user = userEvent.setup();
    (validateCPF as Mock).mockReturnValue(true);
    mockCreateSolicitacao.mockResolvedValue({ mensagem: 'Sucesso' });

    renderWithProviders(<EditProfile />);

    const linkSolicitar = screen.getByText(/solicite ao administrador/i);
    await user.click(linkSolicitar);

    expect(screen.getByText('Solicitar alteração')).toBeInTheDocument();

    const inputNovoCpf = screen.getByPlaceholderText('Ex: 123.456.789-00');
    await user.type(inputNovoCpf, '11122233344');

    const btnEnviar = screen.getByRole('button', {
      name: /Enviar Solicitação/i,
    });
    expect(btnEnviar).toBeEnabled();

    await user.click(btnEnviar);

    await waitFor(() => {
      expect(validateCPF).toHaveBeenCalledWith('11122233344');
      expect(mockCreateSolicitacao).toHaveBeenCalledWith({
        cpfNovo: '11122233344',
        crmNovo: undefined,
      });
      expect(toast.success).toHaveBeenCalledWith('Sucesso');
    });
  });

  it('deve mostrar erro ao tentar solicitar alteração com CPF inválido', async () => {
    const user = userEvent.setup();
    (validateCPF as Mock).mockReturnValue(false);

    renderWithProviders(<EditProfile />);

    await user.click(screen.getByText(/solicite ao administrador/i));

    const inputNovoCpf = screen.getByPlaceholderText('Ex: 123.456.789-00');
    await user.type(inputNovoCpf, '123');

    await user.click(
      screen.getByRole('button', { name: /Enviar Solicitação/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText('CPF inválido. Verifique e tente novamente.')
      ).toBeInTheDocument();
      expect(mockCreateSolicitacao).not.toHaveBeenCalled();
    });
  });

  it('deve selecionar e visualizar uma nova imagem de perfil', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditProfile />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const inputFake = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(inputFake, file);

    await waitFor(() => {
      expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    const buttonAtualizar = screen.getByRole('button', { name: /Atualizar/i });
    expect(buttonAtualizar).toBeEnabled();
  });

  it('deve preencher campos secundários e montar o payload completo (Data de Nascimento, Email, Senhas)', async () => {
    const user = userEvent.setup();
    mockMutateProfile.mockImplementation((payload: any, options: any) => {
      options.onSuccess();
    });

    renderWithProviders(<EditProfile />);

    // Altera o Email
    const inputEmail = screen.getByPlaceholderText('joao@example.com');
    await user.type(inputEmail, 'novoemail@example.com');

    // Altera a Data de Nascimento (Usando fireEvent pois type="date" pode ser chato com userEvent)
    const inputDataNascimento = document.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    fireEvent.change(inputDataNascimento, { target: { value: '1995-05-05' } });

    // Altera Senha e Confirmação
    const inputsSenha = screen.getAllByPlaceholderText('••••••••••');
    await user.type(inputsSenha[0], 'senha123'); // senhaAtual
    await user.type(inputsSenha[1], 'novasenha123'); // novaSenha

    // Clica em Atualizar
    const btnAtualizar = screen.getByRole('button', { name: /Atualizar/i });
    await user.click(btnAtualizar);

    await waitFor(() => {
      expect(mockMutateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'novoemail@example.com',
          dtNascimento: '1995-05-05',
          senhaAtual: 'senha123',
          novaSenha: 'novasenha123',
        }),
        expect.any(Object)
      );
    });
  });

  it('deve acionar o input file invisível ao clicar no botão de câmera', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditProfile />);

    // Pega o input de arquivo diretamente pelo tipo
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Espiona o método nativo "click" do elemento HTML
    const clickSpy = vi.spyOn(fileInput, 'click');

    // Busca o botão da câmera (é o botão dentro da div .group do Avatar)
    const cameraButton = document.querySelector(
      '.group button'
    ) as HTMLButtonElement;

    // Clica no botão de sobreposição da câmera
    await user.click(cameraButton);

    // Valida se o ref repassou o clique pro input de arquivo
    expect(clickSpy).toHaveBeenCalled();
  });

  it('deve alternar a visibilidade da Confirmação de Senha ao clicar no ícone de olho', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditProfile />);

    // Pega as duas senhas. A índice [1] é a "Confirmação de Senha" (novaSenha)
    const inputsSenha = screen.getAllByPlaceholderText('••••••••••');
    const inputConfirmacao = inputsSenha[1];

    expect(inputConfirmacao).toHaveAttribute('type', 'password');

    // Acha o botão dentro da mesma div relativa desse input
    const divRelative = inputConfirmacao.closest('.relative');
    const eyeButton = divRelative?.querySelector('button') as HTMLButtonElement;

    // Clica no botão para alternar setMostrarConfirmacao
    await user.click(eyeButton);

    // Verifica se mudou para texto
    expect(inputConfirmacao).toHaveAttribute('type', 'text');
  });

  it('deve formatar e exibir erros múltiplos (quebra de linha) quando a API de perfil falhar', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Simula a API disparando o onError e rejeitando a Promise interna com várias linhas
    mockMutateProfile.mockImplementation((payload: any, options: any) => {
      options.onError({
        message: 'Erro 1\nErro 2',
        response: { data: { detalhe: 'Falha no BD' } },
      });
    });

    renderWithProviders(<EditProfile />);

    // Edita para habilitar o botão
    const inputNome = screen.getByPlaceholderText('João Silva');
    await user.type(inputNome, 'Maria');

    await user.click(screen.getByRole('button', { name: /Atualizar/i }));

    await waitFor(() => {
      // Verifica se entrou no catch e chamou o toast com a lista gerada pelo split('\n')
      expect(toast.error).toHaveBeenCalledWith(
        'Erro ao atualizar perfil',
        expect.any(Object)
      );
      expect(consoleSpy).toHaveBeenCalledWith({ detalhe: 'Falha no BD' }); // Cobre o console.log(error.response?.data)
    });

    consoleSpy.mockRestore();
  });

  it('deve logar erro se o refetch falhar e limpar a URL de preview ao salvar', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockMutateProfile.mockImplementation((payload: any, options: any) =>
      options.onSuccess()
    );

    // Força o refetch a falhar
    mockRefetch.mockRejectedValue(new Error('Erro de refetch'));

    renderWithProviders(<EditProfile onClose={mockOnClose} />);

    // 1. Simula envio de imagem para gerar o "preview"
    const file = new File(['img'], 'foto.jpg', { type: 'image/jpeg' });
    const inputFake = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(inputFake, file);

    // 2. Edita o nome (gera o payload)
    const inputNome = screen.getByPlaceholderText('João Silva');
    await user.type(inputNome, 'Maria');

    await user.click(screen.getByRole('button', { name: /Atualizar/i }));

    await waitFor(() => {
      // Cobre catch (refetchError) { console.error(...) }
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao refetch da sessão:',
        expect.any(Error)
      );

      // Cobre if (preview) { URL.revokeObjectURL(preview); } no final do handleSubmit
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('mocked-url');
    });

    consoleErrorSpy.mockRestore();
  });

  it('deve limpar a URL de preview da imagem ao desmontar o componente', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<EditProfile />);

    const file = new File(['img'], 'foto.png', { type: 'image/png' });
    const inputFake = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Seta o preview
    await user.upload(inputFake, file);

    // Desmonta o componente, acionando o retorno do useEffect
    unmount();

    // Verifica se limpou a memória
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('mocked-url');
  });
});
