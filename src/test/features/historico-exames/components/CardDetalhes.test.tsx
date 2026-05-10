import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardDetalhes } from '@/features/historico-exames/components/CardDetalhes';

describe('CardDetalhes', () => {
  it('exibe os dados da analise com os rótulos corretos', () => {
    render(<CardDetalhes />);

    expect(screen.getByText('Detalhes da Análise')).toBeInTheDocument();
    expect(screen.getByText('ID da Análise')).toBeInTheDocument();
    expect(screen.getByText('RA-001')).toBeInTheDocument();
    expect(screen.getByText('ID do Paciente')).toBeInTheDocument();
    expect(screen.getByText('0003')).toBeInTheDocument();
    expect(screen.getByText('Nome do Paciente')).toBeInTheDocument();
    expect(screen.getByText('João da Silva')).toBeInTheDocument();
    expect(screen.getByText('Nome do Médico')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos Pereira')).toBeInTheDocument();
    expect(screen.getByText('Data e hora')).toBeInTheDocument();
    expect(screen.getByText('10/05/2023 14:30')).toBeInTheDocument();
  });
});