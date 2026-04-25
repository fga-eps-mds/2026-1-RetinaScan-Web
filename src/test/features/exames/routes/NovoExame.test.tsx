import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NovoExame from '@/features/exames/routes/NovoExame';
import { useCreateExam } from '@/features/exames/hooks/useCreateExam';
import { toast } from 'sonner';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@/features/exames/hooks/useCreateExam', () => ({
  useCreateExam: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NovoExame', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCreateExam).mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    } as any);
  });

  it('envia o formulario com payload correto e redireciona no sucesso', async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockResolvedValue({ id: 'exam-1' });

    render(<NovoExame />);

    await user.type(
      screen.getByPlaceholderText('Digite o nome completo do paciente'),
      'Maria da Silva'
    );
    const birthDateInput = document.querySelector('input[type="date"]');

    expect(birthDateInput).toBeTruthy();
    fireEvent.change(birthDateInput!, { target: { value: '1990-01-15' } });
    await user.selectOptions(screen.getByRole('combobox'), 'FEMININO');
    await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678901');
    await user.type(
      screen.getByPlaceholderText(/comorbidades/i),
      'Hipertensao'
    );
    await user.type(
      screen.getByPlaceholderText(/motivo do exame/i),
      'Paciente com visao turva'
    );

    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
    });

    const payload = mocks.mutateAsync.mock.calls[0][0];

    expect(payload).toEqual({
      nomeCompleto: 'Maria da Silva',
      cpf: '12345678901',
      sexo: 'FEMININO',
      dtNascimento: '1990-01-15',
      dtHora: expect.any(String),
      comorbidades: 'Hipertensao',
      descricao: 'Paciente com visao turva',
    });
    expect(new Date(payload.dtHora).toString()).not.toBe('Invalid Date');

    expect(toast.success).toHaveBeenCalledWith('Exame criado com sucesso.');
    expect(mocks.navigate).toHaveBeenCalledWith('/exames');
  });

  it('mostra erro quando a API falha', async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockRejectedValue({
      response: {
        data: {
          message: 'Erro ao criar exame.',
          errors: {
            cpf: ['CPF invalido.'],
          },
        },
      },
    });

    render(<NovoExame />);

    await user.type(
      screen.getByPlaceholderText('Digite o nome completo do paciente'),
      'Joao Santos'
    );
    const birthDateInput = document.querySelector('input[type="date"]');

    expect(birthDateInput).toBeTruthy();
    fireEvent.change(birthDateInput!, { target: { value: '1985-09-21' } });
    await user.selectOptions(screen.getByRole('combobox'), 'MASCULINO');
    await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678901');
    await user.type(
      screen.getByPlaceholderText(/motivo do exame/i),
      'Checkup'
    );

    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    const cpfErrors = await screen.findAllByText('CPF invalido.');

    expect(cpfErrors.length).toBeGreaterThan(0);
    expect(toast.error).toHaveBeenCalledWith('CPF invalido.');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('desabilita o botao quando mutation esta pendente', () => {
    vi.mocked(useCreateExam).mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: true,
    } as any);

    render(<NovoExame />);

    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
  });
});
