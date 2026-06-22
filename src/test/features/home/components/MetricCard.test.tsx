import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MetricCard } from '@/features/home/components/MetricCard';

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

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
    expect(container.firstChild).toHaveClass('bg-white');
  });

  it('deve aplicar os estilos vermelhos quando a variante for "danger"', () => {
    const { container } = render(<MetricCard {...defaultProps} variant="danger" />);
    expect(container.firstChild).toHaveClass('bg-red-50');
  });

  it('deve aplicar os estilos verdes quando a variante for "success"', () => {
    const { container } = render(<MetricCard {...defaultProps} variant="success" />);
    expect(container.firstChild).toHaveClass('bg-green-50');
  });

  it('deve aplicar os estilos azuis quando a variante for "info"', () => {
    const { container } = render(<MetricCard {...defaultProps} variant="info" />);
    expect(container.firstChild).toHaveClass('bg-blue-50');
  });

  it('deve aplicar os estilos amarelos quando a variante for "warning"', () => {
    const { container } = render(<MetricCard {...defaultProps} variant="warning" />);
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('não deve renderizar o ícone de tooltip se a prop tooltipInfo não for passada', () => {
    render(<MetricCard {...defaultProps} />);
    const tooltipButton = screen.queryByRole('button');
    expect(tooltipButton).not.toBeInTheDocument();
  });

  it('deve renderizar o ícone e o texto do tooltip quando tooltipInfo for fornecido', () => {
    render(<MetricCard {...defaultProps} tooltipInfo="Texto explicativo da métrica" />);
    
    const tooltipButton = screen.getByRole('button', { name: /Informação sobre Total de Exames/i });
    expect(tooltipButton).toBeInTheDocument();
    expect(screen.getByText('Texto explicativo da métrica')).toBeInTheDocument();
  });
});