import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { Comorbidades } from '@/features/criacao-exames/components/Comorbidades';

describe('Comorbidades', () => {
  let mockOnChange: Mock<(value: string) => void>;
  let mockOnClearError: Mock<() => void>;

  beforeEach(() => {
    mockOnChange = vi.fn<(value: string) => void>();
    mockOnClearError = vi.fn<() => void>();
  });

  describe('renderização inicial', () => {
    it('renderiza o componente com todos os checkboxes visíveis', () => {
      render(
        <Comorbidades onChange={mockOnChange} />
      );

      expect(screen.getByText('Comorbidades')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Diabetes' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Hipertensão' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Alta miopia' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Glaucoma' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Uso de hidroxicloroquina' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Uveíte' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Catarata' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Outras' })).toBeInTheDocument();
    });

    it('renderiza a seção de qualidade técnica do exame', () => {
      render(
        <Comorbidades onChange={mockOnChange} />
      );

      expect(screen.getByText('Qualidade técnica do exame')).toBeInTheDocument();
      expect(screen.getByText('Houve alguma dificuldade para realização do exame?')).toBeInTheDocument();
    });

    it('chama onChange com string vazia ao inicializar', () => {
      render(
        <Comorbidades onChange={mockOnChange} />
      );

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('mostra mensagem de erro quando prop error é fornecida', () => {
      render(
        <Comorbidades onChange={mockOnChange} error="Comorbidade inválida" />
      );

      expect(screen.getByText('Comorbidade inválida')).toBeInTheDocument();
    });
  });

  describe('comorbidades simples', () => {
    it('atualiza summary quando marca Alta miopia', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Alta miopia' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Alta miopia');
      });
    });

    it('atualiza summary com múltiplas comorbidades simples', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Alta miopia' }));
      await user.click(screen.getByRole('checkbox', { name: 'Glaucoma' }));
      await user.click(screen.getByRole('checkbox', { name: 'Catarata' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          'Alta miopia; Glaucoma; Catarata'
        );
      });
    });

    it('remove comorbidade do summary quando desmarca', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      const altaMiopiaCheckbox = screen.getByRole('checkbox', { name: 'Alta miopia' });

      await user.click(altaMiopiaCheckbox);
      await user.click(altaMiopiaCheckbox);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith('');
      });
    });
  });

  describe('diabetes', () => {
    it('mostra campos adicionais quando marca diabetes', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));

      expect(screen.getByLabelText('Quantos anos')).toBeInTheDocument();
      expect(screen.getByLabelText('Uso de insulina')).toBeInTheDocument();
      expect(screen.getByLabelText('Controle do diabetes')).toBeInTheDocument();
    });

    it('chama onClearError quando marca diabetes', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} onClearError={mockOnClearError} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));

      expect(mockOnClearError).toHaveBeenCalled();
    });

    it('gera summary com "Diabetes" quando apenas checkbox marcado', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Diabetes');
      });
    });

    it('adiciona anos de diabetes ao summary', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
      const anosInput = screen.getByPlaceholderText('Ex: 10');
      await user.type(anosInput, '5');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Diabetes (5 anos)');
      });
    });

    it('adiciona uso de insulina ao summary', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
      const insulinaSelect = screen.getByLabelText('Uso de insulina');
      await user.selectOptions(insulinaSelect, 'SIM');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Diabetes (com uso de insulina)');
      });
    });

    it('adiciona controle de diabetes ao summary', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
      const controleSelect = screen.getByLabelText('Controle do diabetes');
      await user.selectOptions(controleSelect, 'SIM');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Diabetes (controlado)');
      });
    });

    it('combina todos os detalhes de diabetes no summary', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
      const anosInput = screen.getByPlaceholderText('Ex: 10');
      await user.type(anosInput, '10');

      const insulinaSelect = screen.getByLabelText('Uso de insulina');
      await user.selectOptions(insulinaSelect, 'SIM');

      const controleSelect = screen.getByLabelText('Controle do diabetes');
      await user.selectOptions(controleSelect, 'NAO');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          'Diabetes (10 anos, com uso de insulina, não controlado)'
        );
      });
    });

    it('limpa campos adicionais de diabetes ao desmarcar', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      const diabetesCheckbox = screen.getByRole('checkbox', { name: 'Diabetes' });

      await user.click(diabetesCheckbox);
      const anosInput = screen.getByPlaceholderText('Ex: 10');
      await user.type(anosInput, '5');

      await user.click(diabetesCheckbox);

      expect(screen.queryByLabelText('Quantos anos')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith('');
      });
    });

    it('chama onClearError ao preencher campo de diabetes', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} onClearError={mockOnClearError} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));

      const anosInput = screen.getByPlaceholderText('Ex: 10');
      mockOnClearError.mockClear();
      await user.type(anosInput, '5');

      expect(mockOnClearError).toHaveBeenCalled();
    });
  });

  describe('hipertensão', () => {
    it('mostra campo de controle quando marca hipertensão', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Hipertensão' }));

      expect(screen.getByLabelText('Controle da hipertensão')).toBeInTheDocument();
    });

    it('gera summary com "Hipertensão" quando apenas checkbox marcado', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Hipertensão' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Hipertensão');
      });
    });

    it('adiciona controle ao summary', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Hipertensão' }));
      const controleSelect = screen.getByLabelText('Controle da hipertensão');
      await user.selectOptions(controleSelect, 'SIM');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Hipertensão (controlada)');
      });
    });

    it('mostra "não controlada" quando seleciona NAO', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Hipertensão' }));
      const controleSelect = screen.getByLabelText('Controle da hipertensão');
      await user.selectOptions(controleSelect, 'NAO');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Hipertensão (não controlada)');
      });
    });

    it('limpa campo de controle ao desmarcar', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      const hipertensaoCheckbox = screen.getByRole('checkbox', { name: 'Hipertensão' });

      await user.click(hipertensaoCheckbox);
      const controleSelect = screen.getByLabelText('Controle da hipertensão');
      await user.selectOptions(controleSelect, 'SIM');

      await user.click(hipertensaoCheckbox);

      expect(screen.queryByLabelText('Controle da hipertensão')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith('');
      });
    });

    it('chama onClearError ao marcar hipertensão', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} onClearError={mockOnClearError} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Hipertensão' }));

      expect(mockOnClearError).toHaveBeenCalled();
    });
  });

  describe('outras comorbidades', () => {
    it('mostra campo de descrição quando marca "Outras"', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Outras' }));

      expect(screen.getByPlaceholderText('Ex: Degeneração macular')).toBeInTheDocument();
    });

    it('gera summary com "Outras" quando apenas checkbox marcado', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Outras' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Outras');
      });
    });

    it('adiciona descrição ao summary', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Outras' }));
      const descricaoInput = screen.getByPlaceholderText('Ex: Degeneração macular');
      await user.type(descricaoInput, 'Retinopatia pigmentosa');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Outras: Retinopatia pigmentosa');
      });
    });

    it('ignora espaços em branco na descrição', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Outras' }));
      const descricaoInput = screen.getByPlaceholderText('Ex: Degeneração macular');
      await user.type(descricaoInput, '   ');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Outras');
      });
    });

    it('limpa descrição ao desmarcar', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      const outrasCheckbox = screen.getByRole('checkbox', { name: 'Outras' });

      await user.click(outrasCheckbox);
      const descricaoInput = screen.getByPlaceholderText('Ex: Degeneração macular');
      await user.type(descricaoInput, 'Retinopatia pigmentosa');

      await user.click(outrasCheckbox);

      expect(screen.queryByPlaceholderText('Ex: Degeneração macular')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith('');
      });
    });
  });

  describe('qualidade técnica do exame', () => {
    it('marca "Sim" quando há dificuldade', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      const simRadio = screen.getAllByRole('radio', { name: 'Sim' })[0];
      await user.click(simRadio);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          'Qualidade técnica do exame: houve dificuldade para realização do exame'
        );
      });
    });

    it('marca "Não" quando não há dificuldade', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      const naoRadio = screen.getAllByRole('radio', { name: 'Não' })[0];
      await user.click(naoRadio);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          'Qualidade técnica do exame: não houve dificuldade para realização do exame'
        );
      });
    });

    it('combina qualidade técnica com outras comorbidades', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Glaucoma' }));

      const simRadio = screen.getAllByRole('radio', { name: 'Sim' })[0];
      await user.click(simRadio);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          'Glaucoma; Qualidade técnica do exame: houve dificuldade para realização do exame'
        );
      });
    });
  });

  describe('combinações complexas', () => {
    it('gera summary correto com diabetes, hipertensão e outras comorbidades', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      // Diabetes com detalhes
      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
      const anosInput = screen.getByPlaceholderText('Ex: 10');
      await user.type(anosInput, '15');

      // Hipertensão com controle
      await user.click(screen.getByRole('checkbox', { name: 'Hipertensão' }));
      const controleHipertensao = screen.getByLabelText('Controle da hipertensão');
      await user.selectOptions(controleHipertensao, 'SIM');

      // Outras comorbidades
      await user.click(screen.getByRole('checkbox', { name: 'Outras' }));
      const descricaoInput = screen.getByPlaceholderText('Ex: Degeneração macular');
      await user.type(descricaoInput, 'Retinopatia');

      // Qualidade técnica
      const naoRadio = screen.getAllByRole('radio', { name: 'Não' })[0];
      await user.click(naoRadio);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          'Diabetes (15 anos); Hipertensão (controlada); Outras: Retinopatia; Qualidade técnica do exame: não houve dificuldade para realização do exame'
        );
      });
    });

    it('gera summary com todas as comorbidades simples marcadas', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Alta miopia' }));
      await user.click(screen.getByRole('checkbox', { name: 'Glaucoma' }));
      await user.click(screen.getByRole('checkbox', { name: 'Uso de hidroxicloroquina' }));
      await user.click(screen.getByRole('checkbox', { name: 'Uveíte' }));
      await user.click(screen.getByRole('checkbox', { name: 'Catarata' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          'Alta miopia; Glaucoma; Uso de hidroxicloroquina; Uveíte; Catarata'
        );
      });
    });
  });

  describe('callbacks e limpeza de erros', () => {
    it('chama onClearError ao marcar checkbox simples', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} onClearError={mockOnClearError} error="Erro" />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Glaucoma' }));

      expect(mockOnClearError).toHaveBeenCalled();
    });

    it('chama onClearError ao preencher input de anos de diabetes', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} onClearError={mockOnClearError} error="Erro" />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
      mockOnClearError.mockClear();

      const anosInput = screen.getByPlaceholderText('Ex: 10');
      await user.type(anosInput, '5');

      expect(mockOnClearError).toHaveBeenCalled();
    });

    it('chama onClearError ao selecionar opção de insulina', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} onClearError={mockOnClearError} error="Erro" />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
      mockOnClearError.mockClear();

      const insulinaSelect = screen.getByLabelText('Uso de insulina');
      await user.selectOptions(insulinaSelect, 'SIM');

      expect(mockOnClearError).toHaveBeenCalled();
    });

    it('chama onClearError ao clicar em radio button de qualidade técnica', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} onClearError={mockOnClearError} error="Erro" />
      );

      const simRadio = screen.getAllByRole('radio', { name: 'Sim' })[0];
      await user.click(simRadio);

      expect(mockOnClearError).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('mantém state ao mudar entre diferentes comorbidades', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Glaucoma' }));
      await user.click(screen.getByRole('checkbox', { name: 'Catarata' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Glaucoma; Catarata');
      });

      await user.click(screen.getByRole('checkbox', { name: 'Glaucoma' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Catarata');
      });
    });

    it('trata entrada vazia no campo de descrição de outras comorbidades', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      await user.click(screen.getByRole('checkbox', { name: 'Outras' }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Outras');
      });
    });

    it('não chama onClearError quando prop não é fornecida', async () => {
      const user = userEvent.setup();

      render(
        <Comorbidades onChange={mockOnChange} />
      );

      // Não deve lançar erro
      await user.click(screen.getByRole('checkbox', { name: 'Diabetes' }));
    });
  });
});
