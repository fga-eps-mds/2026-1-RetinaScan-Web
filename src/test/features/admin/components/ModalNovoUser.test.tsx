import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import ModalNovoUser from '@/features/admin/components/ModalNovoUser';
import { useCreateUser } from '@/features/admin/hooks/useCreateUser';

// Mock do módulo
vi.mock('@/features/admin/hooks/useCreateUser', () => ({
  useCreateUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Correção para Radix UI / JSDOM
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
    // Uso correto do vi.mocked para tipagem e funcionalidade
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
});
