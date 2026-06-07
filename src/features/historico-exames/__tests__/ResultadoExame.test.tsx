import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock react-router hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the data hook
vi.mock('../hooks/useGetResultadoExame', () => ({
  useGetResultadoExame: (id: string) => ({
    data: {
      exam: { id: id, comorbidades: [] },
      imagens: [],
    },
    isLoading: false,
    isError: false,
    isFetching: false,
  }),
}));

import ResultadoExame from '../routes/ResultadoExame';

describe('ResultadoExame', () => {
  it('renders page with data', () => {
    render(<ResultadoExame />);

    // The exam id should be rendered
    expect(screen.getByText(/Exame 1/)).toBeDefined();
    // Expect action buttons
    expect(screen.getByText('Baixar Laudo')).toBeDefined();
  });
});
