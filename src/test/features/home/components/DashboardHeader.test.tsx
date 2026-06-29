import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardHeader } from '@/features/home/components/DashboardHeader';

describe('DashboardHeader', () => {
  it('deve renderizar corretamente o badge, o nome do usuário e o subtítulo', () => {
    // Arrange
    const mockProps = {
      userName: 'Ana Silva',
      badgeText: 'Visão Geral',
      subtitle: 'Acompanhe as métricas do sistema.'
    };

    // Act
    render(<DashboardHeader {...mockProps} />);

    // Assert
    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    
    // O nome 'Ana Silva' fica dentro de um <span>, e o texto base fica fora.
    // O React Testing Library consegue achar ambos separadamente ou por regex.
    expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    expect(screen.getByText(/Seja bem-vindo\(a\),/i)).toBeInTheDocument();

    expect(screen.getByText('Acompanhe as métricas do sistema.')).toBeInTheDocument();
  });
});