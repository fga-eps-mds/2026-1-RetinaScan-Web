import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardImagens } from '@/features/historico-exames/components/CardImagens';

describe('CardImagens', () => {
  it('mostra as imagens e os status de cada olho', () => {
    render(<CardImagens />);

    expect(screen.getByText('Imagens da Retinografia')).toBeInTheDocument();
    expect(screen.getByText('Olho direito (OD)')).toBeInTheDocument();
    expect(screen.getByText('Olho esquerdo (OE)')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Alterado')).toBeInTheDocument();
    expect(
      screen.getByAltText('Retinografia do olho direito')
    ).toBeInTheDocument();
    expect(
      screen.getByAltText('Retinografia do olho esquerdo')
    ).toBeInTheDocument();
  });
});