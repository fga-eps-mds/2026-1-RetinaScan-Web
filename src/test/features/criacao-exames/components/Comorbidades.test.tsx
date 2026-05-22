import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useState } from 'react';
import {
  Comorbidades,
  type ComorbidadesFormValue,
} from '@/features/criacao-exames/components/Comorbidades';

const createInitialValue = (): ComorbidadesFormValue => ({
  diabetes: false,
  diabetesAnos: undefined,
  diabetesUsoInsulina: false,
  diabetesControlado: false,
  hipertensao: false,
  hipertensaoControlada: false,
  altaMiopia: false,
  glaucoma: false,
  usoHidroxicloroquina: false,
  uveite: false,
  catarata: false,
  outrasComorbidades: false,
  outrasComorbidadesDescricao: undefined,
  qualidadeTecnicaDificuldade: false,
});

describe('Comorbidades', () => {
  let mockOnChange: Mock<(value: ComorbidadesFormValue) => void>;
  let mockOnClearError: Mock<() => void>;

  beforeEach(() => {
    mockOnChange = vi.fn<(value: ComorbidadesFormValue) => void>();
    mockOnClearError = vi.fn<() => void>();
  });

  function Harness({ error }: { error?: string }) {
    const [value, setValue] = useState(createInitialValue());

    return (
      <Comorbidades
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue);
          mockOnChange(nextValue);
        }}
        onClearError={mockOnClearError}
        error={error}
      />
    );
  }

  const renderComponent = (
    valueOverrides: Partial<ComorbidadesFormValue> = {},
    error?: string
  ) =>
    render(
      <Comorbidades
        value={{ ...createInitialValue(), ...valueOverrides }}
        onChange={mockOnChange}
        onClearError={mockOnClearError}
        error={error}
      />
    );

  it('renderiza os controles principais e a seção de qualidade técnica', () => {
    renderComponent();

    expect(screen.getByText('Comorbidades')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Diabetes' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Hipertensão' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Alta miopia' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Glaucoma' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Uso de hidroxicloroquina' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Uveíte' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Catarata' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Outras' })).toBeInTheDocument();
    expect(screen.getByText('Qualidade técnica do exame')).toBeInTheDocument();
    expect(screen.getByText('Houve alguma dificuldade para realização do exame?')).toBeInTheDocument();
  });

  it('mostra mensagem de erro quando prop error é fornecida', () => {
    renderComponent({}, 'Comorbidade inválida');

    expect(screen.getByText('Comorbidade inválida')).toBeInTheDocument();
  });

  it('atualiza o objeto ao marcar e desmarcar comorbidades simples', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await user.click(screen.getByRole('checkbox', { name: 'Alta miopia' }));

    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ altaMiopia: true })
    );
    expect(mockOnClearError).toHaveBeenCalled();

    mockOnChange.mockClear();
    mockOnClearError.mockClear();

    await user.click(screen.getByRole('checkbox', { name: 'Alta miopia' }));

    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ altaMiopia: false })
    );
  });

  it('exibe e atualiza os campos de diabetes', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));

    expect(screen.getByPlaceholderText('Ex: 10')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Uso de insulina' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Diabetes controlado' })).toBeInTheDocument();

    const anosInput = screen.getByPlaceholderText('Ex: 10');
    await user.clear(anosInput);
    await user.type(anosInput, '5');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ diabetesAnos: 5 })
      );
    });
    expect(mockOnClearError).toHaveBeenCalled();
  });

  it('limpa os campos auxiliares de diabetes ao desmarcar', async () => {
    const user = userEvent.setup();

    renderComponent({
      diabetes: true,
      diabetesAnos: 10,
      diabetesUsoInsulina: true,
      diabetesControlado: true,
    });

    await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        diabetes: false,
        diabetesAnos: undefined,
        diabetesUsoInsulina: false,
        diabetesControlado: false,
      })
    );
  });

  it('atualiza hipertensão e o controle associado', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await user.click(screen.getByRole('checkbox', { name: 'Hipertensão' }));
    expect(screen.getByRole('checkbox', { name: 'Hipertensão controlada' })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Hipertensão controlada' }));

    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ hipertensaoControlada: true })
    );
  });

  it('mostra e atualiza a descrição de outras comorbidades', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await user.click(screen.getByRole('checkbox', { name: 'Outras' }));

    const descricaoInput = screen.getByPlaceholderText('Ex: Degeneração macular');
    await user.type(descricaoInput, 'Retinopatia pigmentosa');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          outrasComorbidades: true,
          outrasComorbidadesDescricao: 'Retinopatia pigmentosa',
        })
      );
    });
  });

  it('trata entrada apenas com espaços em branco na descrição de outras comorbidades', async () => {
    const user = userEvent.setup();

    renderComponent({ outrasComorbidades: true });

    const descricaoInput = screen.getByPlaceholderText('Ex: Degeneração macular');
    await user.type(descricaoInput, '   ');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ outrasComorbidadesDescricao: undefined })
      );
    });
  });

  it('marca a dificuldade de qualidade técnica', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('checkbox', { name: 'Sim' }));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ qualidadeTecnicaDificuldade: true })
    );
    expect(mockOnClearError).toHaveBeenCalled();
  });

  it('não chama onClearError quando a prop não é fornecida', async () => {
    const user = userEvent.setup();

    render(
      <Comorbidades value={createInitialValue()} onChange={mockOnChange} />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));

    expect(mockOnChange).toHaveBeenCalled();
  });
});
