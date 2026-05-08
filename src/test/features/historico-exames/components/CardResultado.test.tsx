import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardResultado } from '@/features/historico-exames/components/CardResultado';

describe('CardResultado', () => {
  it('exibe o resultado da IA, a recomendacao e as acoes do fluxo', () => {
    render(<CardResultado />);

    expect(
      screen.getByText('Análise da Inteligência Artificial')
    ).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Recomendação clínica')).toBeInTheDocument();
    expect(
      screen.getByText(
        'O scan de retina apresenta aspecto normal. Continue o monitoramento conforme a recomendação médica.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rejeitar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Validar' })).toBeInTheDocument();
  });
});