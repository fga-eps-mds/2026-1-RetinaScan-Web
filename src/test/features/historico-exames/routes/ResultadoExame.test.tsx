import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';

vi.mock('@/features/historico-exames/components/CardImagens', () => ({
  CardImagens: () => <div data-testid="card-imagens-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardResultado', () => ({
  CardResultado: () => <div data-testid="card-resultado-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardDetalhes', () => ({
  CardDetalhes: () => <div data-testid="card-detalhes-mock" />,
}));

describe('ResultadoExame', () => {
  it('renderiza o cabeçalho, as ações principais e os cards da tela', () => {
    render(<ResultadoExame />);

    expect(screen.getByRole('heading', { name: /exame ra-001/i })).toBeInTheDocument();
    expect(
      screen.getByText('Detalhes e resultado do exame')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar laudo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument();
    expect(screen.getByTestId('card-imagens-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-resultado-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-detalhes-mock')).toBeInTheDocument();
  });
});