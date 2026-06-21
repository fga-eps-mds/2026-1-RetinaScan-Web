import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '@/features/home/components/MetricCard';

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Total de Exames',
    value: 150,
    subtext: 'Nos últimos 30 dias',
  };

  it('deve renderizar o título, valor numérico e subtítulo corretamente', () => {
    render(<MetricCard {...defaultProps} />);

    expect(screen.getByText('Total de Exames')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Nos últimos 30 dias')).toBeInTheDocument();
  });

  it('deve aplicar os estilos da variante "default" quando nenhuma variante for passada', () => {
    const { container } = render(<MetricCard {...defaultProps} />);
    
    // Verifica se a classe base de cor branca foi aplicada no container principal
    expect(container.firstChild).toHaveClass('bg-white');
  });

  it('deve aplicar os estilos vermelhos quando a variante for "danger"', () => {
    const { container } = render(<MetricCard {...defaultProps} variant="danger" />);
    
    expect(container.firstChild).toHaveClass('bg-red-50');
    expect(container.firstChild).toHaveClass('border-red-100');
  });

  it('deve aplicar os estilos verdes quando a variante for "success"', () => {
    const { container } = render(<MetricCard {...defaultProps} variant="success" />);
    
    expect(container.firstChild).toHaveClass('bg-green-50');
    expect(container.firstChild).toHaveClass('border-green-100');
  });

  it('deve aplicar os estilos azuis quando a variante for "info"', () => {
    const { container } = render(<MetricCard {...defaultProps} variant="info" />);
    
    expect(container.firstChild).toHaveClass('bg-blue-50');
    expect(container.firstChild).toHaveClass('border-blue-100');
  });
});