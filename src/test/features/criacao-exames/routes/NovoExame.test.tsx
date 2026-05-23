import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NovoExame from '@/features/criacao-exames/routes/NovoExame';
import { useCreateExam } from '@/features/criacao-exames/hooks/useCreateExam';
import { toast } from 'sonner';
import { MemoryRouter } from 'react-router';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@/features/criacao-exames/hooks/useCreateExam', () => ({
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

const fillBaseForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(
    screen.getByPlaceholderText('Digite o nome completo do paciente'),
    'Maria da Silva'
  );

  fireEvent.change(screen.getByLabelText('Data de nascimento'), {
    target: { value: '1990-01-15' },
  });
  await user.selectOptions(screen.getByLabelText('Sexo'), 'FEMININO');
  await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678901');

  await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
  await user.type(screen.getByLabelText('Quantos anos'), '12');
  await user.click(screen.getByRole('checkbox', { name: 'Uso de insulina' }));

  await user.click(screen.getByRole('checkbox', { name: 'Alta miopia' }));
  await user.click(screen.getByRole('checkbox', { name: 'Sim' }));

  await user.type(
    screen.getByPlaceholderText(/motivo do exame/i),
    'Paciente com visão turva'
  );
};

describe('NovoExame', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCreateExam).mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    } as any);
  });

  it('envia o formulário com payload correto e redireciona no sucesso', async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockResolvedValue({ id: 'exam-1' });

    render(
      <MemoryRouter>
        <NovoExame />
      </MemoryRouter>
    );

    await fillBaseForm(user);
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
      comorbidades: expect.objectContaining({
        diabetes: true,
        diabetesAnos: 12,
        diabetesUsoInsulina: true,
        altaMiopia: true,
        qualidadeTecnicaDificuldade: true,
      }),
      descricao: 'Paciente com visão turva',
    });
    expect(new Date(payload.dtHora).toString()).not.toBe('Invalid Date');

    expect(toast.success).toHaveBeenCalledWith(
      'Exame criado com sucesso. Redirecionando para upload...'
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/exames/upload/exam-1');
  });

  it('mostra erro quando a API falha', async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockRejectedValue({
      response: {
        data: {
          message: 'Erro ao criar exame.',
          errors: {
            cpf: ['CPF inválido.'],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <NovoExame />
      </MemoryRouter>
    );

    await fillBaseForm(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findAllByText('CPF inválido.')).toHaveLength(2);
    expect(toast.error).toHaveBeenCalledWith('CPF inválido.');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('desabilita o botão quando a mutation está pendente', () => {
    vi.mocked(useCreateExam).mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: true,
    } as any);

    render(
      <MemoryRouter>
        <NovoExame />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
  });

  it('navega para upload page com exam id após criar exame com sucesso', async () => {
    const user = userEvent.setup();
    const examId = '550e8400-e29b-41d4-a716-446655440000';

    mocks.mutateAsync.mockResolvedValue({ id: examId });

    render(
      <MemoryRouter>
        <NovoExame />
      </MemoryRouter>
    );

    await fillBaseForm(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith(`/exames/upload/${examId}`);
    });
  });
});
