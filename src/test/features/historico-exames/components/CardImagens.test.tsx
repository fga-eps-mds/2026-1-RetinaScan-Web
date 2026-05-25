import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardImagens } from '@/features/historico-exames/components/CardImagens';

describe('CardImagens', () => {
  it('mostra os placeholders quando nenhuma imagem é fornecida', () => {
    render(<CardImagens />);

    expect(screen.getByText('Imagens da Retinografia')).toBeInTheDocument();
    expect(screen.getByText('Olho direito (OD)')).toBeInTheDocument();
    expect(screen.getByText('Olho esquerdo (OE)')).toBeInTheDocument();
    
    // Verifica os placeholders em vez dos status que não existem
    expect(screen.getByText('Imagem do olho direito indisponível')).toBeInTheDocument();
    expect(screen.getByText('Imagem do olho esquerdo indisponível')).toBeInTheDocument();
  });

  it('renderiza as imagens corretamente quando fornecidas', () => {
    const mockImagens = [
      { lateralidadeOlho: 'OD', url: 'https://exemplo.com/od.jpg' },
      { lateralidadeOlho: 'OE', url: 'https://exemplo.com/oe.jpg' }
    ];

    render(<CardImagens imagens={mockImagens as any} />);

    // As tags img devem estar na tela com os atributos alt corretos
    const imgOd = screen.getByAltText('Retinografia do olho direito');
    const imgOe = screen.getByAltText('Retinografia do olho esquerdo');

    expect(imgOd).toBeInTheDocument();
    expect(imgOd).toHaveAttribute('src', 'https://exemplo.com/od.jpg');

    expect(imgOe).toBeInTheDocument();
    expect(imgOe).toHaveAttribute('src', 'https://exemplo.com/oe.jpg');

    // Os placeholders não devem estar na tela
    expect(screen.queryByText('Imagem do olho direito indisponível')).not.toBeInTheDocument();
    expect(screen.queryByText('Imagem do olho esquerdo indisponível')).not.toBeInTheDocument();
  });
});