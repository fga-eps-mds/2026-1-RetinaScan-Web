import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardDetalhes } from '@/features/historico-exames/components/CardDetalhes';

describe('CardDetalhes', () => {
  it('exibe os dados do exame com os rótulos e valores corretos', () => {
    const mockExame = {
      id: 'EX-9999',
      medico: {
        nomeCompleto: 'Dr. Carlos Pereira',
      },
      dtHora: '2026-05-23T14:30:00.000Z', 
      olho: 'OD',
      nomeCompleto: 'João da Silva',
      cpf: '123.456.789-00',
      status: 'Concluído',
      dtNascimento: '1990-01-15T00:00:00.000Z', // Adicionado o timestamp para evitar problemas de fuso horário no toLocaleDateString
      descricao: 'Paciente apresenta visão normal.',
    };

    render(<CardDetalhes exame={mockExame as any} />);

    expect(screen.getByText('Detalhes do Exame')).toBeInTheDocument();
    expect(screen.getByText('ID do Exame')).toBeInTheDocument();
    expect(screen.getByText('Nome do Médico')).toBeInTheDocument();
    expect(screen.getByText('Data e hora')).toBeInTheDocument();
    expect(screen.getByText('Olho')).toBeInTheDocument();
    expect(screen.getByText('Nome do Paciente')).toBeInTheDocument();
    expect(screen.getByText('CPF')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Data de nascimento')).toBeInTheDocument();

    expect(screen.getByText('EX-9999')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos Pereira')).toBeInTheDocument();
    expect(screen.getByText('OD')).toBeInTheDocument();
    expect(screen.getByText('João da Silva')).toBeInTheDocument();
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();

    const dataFormatada = new Date(mockExame.dtHora).toLocaleString();
    expect(screen.getByText(dataFormatada)).toBeInTheDocument();

    // Validando a conversão da data de nascimento
    const dataNascimentoFormatada = new Date(mockExame.dtNascimento).toLocaleDateString();
    expect(screen.getByText(dataNascimentoFormatada)).toBeInTheDocument();
  });

  it('deve exibir "AO" como fallback quando o valor do olho for nulo ou undefined', () => {
    const mockExameIncompleto = {
      id: 'EX-0000',
      medico: { nomeCompleto: 'Dr. Silva' },
      dtHora: '2026-05-23T12:00:00.000Z',
      olho: undefined,
      nomeCompleto: 'Paciente Teste',
      cpf: '000.000.000-00',
      status: 'Pendente',
      dtNascimento: '2000-01-01T00:00:00.000Z',
      descricao: '',
    };

    render(<CardDetalhes exame={mockExameIncompleto as any} />);

    expect(screen.getByText('AO')).toBeInTheDocument();
  });
});
