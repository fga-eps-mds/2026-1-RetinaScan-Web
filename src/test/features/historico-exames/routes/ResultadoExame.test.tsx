import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('@/features/historico-exames/hooks/useGetResultadoExame', () => ({
  useGetResultadoExame: () => ({
    data: {
      exam: {
        id: 'EX-2026-0036',
        idUsuario: 'USR-001',
        nomeCompleto: 'João da Silva',
        cpf: '123.456.789-00',
        sexo: 'MASCULINO',
        dtNascimento: '1990-01-01',
        dtHora: '2026-05-22T10:30:00Z',
        status: 'CONCLUIDO',
        olho: 'OD',
      },
      imagens: [],
      resultadosIa: [],
    },
    isLoading: false,
    isError: false,
  }),
}));

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
    render(
      <MemoryRouter initialEntries={['/exames/EX-2026-0036']}>
        <Routes>
          <Route path="/exames/:id" element={<ResultadoExame />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /exame ex-2026-0036/i })).toBeInTheDocument();
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