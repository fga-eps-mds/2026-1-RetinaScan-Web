import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import ModalNovoUser from '@/features/admin/components/ModalNovoUser';
import { useCreateUser } from '@/features/admin/hooks/useCreateUser';

vi.mock('@/features/admin/hooks/useCreateUser', () => ({
  useCreateUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

// Mock do componente Select do shadcn/ui.
// Transformamos a complexidade do Radix em um select HTML simples para facilitar a simulação do fireEvent.
// O parâmetro 'children' foi removido para evitar o erro ts(6133) de variável não utilizada.
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange }: any) => (
    <select
      data-testid="perfil-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="MEDICO">Médico</option>
      <option value="ESPECIALISTA">Médico Especialista</option>
    </select>
  ),
  SelectContent: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();
vi.stubGlobal(
  'PointerEvent',
  class extends Event {} as unknown as typeof PointerEvent
);

describe('ModalNovoUser', () => {
  const mockMutateAsync = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateUser).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it('não deve renderizar nada se isOpen for false', () => {
    render(<ModalNovoUser isOpen={false} onClose={onClose} />);
    expect(screen.queryByText('Cadastro de Usuário')).toBeNull();
  });

  it('deve formatar CPF e CRM enquanto o usuário digita', () => {
    render(<ModalNovoUser isOpen={true} onClose={onClose} />);

    const cpfInput = screen.getByPlaceholderText('000.000.000-00');
    fireEvent.change(cpfInput, { target: { value: '12345678901' } });
    expect(cpfInput).toHaveValue('123.456.789-01');

    const crmInput = screen.getByPlaceholderText('000000/UF');
    fireEvent.change(crmInput, { target: { value: '123456SP' } });
    expect(crmInput).toHaveValue('123456/SP');
  });

  it('deve exibir erro se as senhas forem diferentes', async () => {
    render(<ModalNovoUser isOpen={true} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirme sua senha'), {
      target: { value: '456' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /cadastrar/i }));

    expect(toast.error).toHaveBeenCalledWith('As senhas não coincidem.');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('deve desabilitar o botão enquanto está carregando', () => {
    vi.mocked(useCreateUser).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);

    render(<ModalNovoUser isOpen={true} onClose={onClose} />);
    const submitBtn = screen.getByRole('button', { name: /cadastrando.../i });
    expect(submitBtn).toBeDisabled();
  });

  

  it('deve enviar o formulário com sucesso assumindo MEDICO como perfil padrão', async () => {
    render(<ModalNovoUser isOpen={true} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('Digite o nome do usuário'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'joao@retinascan.local' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '11122233344' } });
    fireEvent.change(screen.getByPlaceholderText('000000/UF'), { target: { value: '123456SP' } });
    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirme sua senha'), { target: { value: 'senha123' } });

    // Envia o form sem interagir com o Select de perfil (deve assumir o defaultValue)
    fireEvent.submit(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeCompleto: 'João Silva',
          cpf: '11122233344', // Garantindo que o mock testa a limpeza da máscara
          tipoPerfil: 'MEDICO', // O comportamento padrão exigido
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Usuário cadastrado com sucesso.');
    });
  });

  it('deve permitir alterar o perfil para ESPECIALISTA e enviar no payload', async () => {
    render(<ModalNovoUser isOpen={true} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('Digite o nome do usuário'), { target: { value: 'Dra. Maria' } });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'maria@retinascan.local' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '11122233344' } });
    fireEvent.change(screen.getByPlaceholderText('000000/UF'), { target: { value: '123456SP' } });
    fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirme sua senha'), { target: { value: 'senha123' } });

    // Interage com o mock do Select para alterar o perfil
    const select = screen.getByTestId('perfil-select');
    fireEvent.change(select, { target: { value: 'ESPECIALISTA' } });

    fireEvent.submit(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeCompleto: 'Dra. Maria',
          tipoPerfil: 'ESPECIALISTA', // O estado alterado deve ser refletido aqui
        })
      );
    });
  });
});