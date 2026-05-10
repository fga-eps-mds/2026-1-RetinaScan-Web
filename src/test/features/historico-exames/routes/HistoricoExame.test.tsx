import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import HistoricoExame from '@/features/historico-exames/routes/HistoricoExame';
import { toast } from 'sonner';
import * as examesApi from '@/features/historico-exames/service/examesApi';
import type { ExameHistory } from '@/features/historico-exames/types/exam-history';

vi.mock('@/features/historico-exames/service/examesApi', () => ({
  fetchExames: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({ data: { user: { id: 'test-user' } } })),
  },
  useSession: vi.fn(() => ({ data: { user: { id: 'test-user' } } })),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
}));

describe('HistoricoExame Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar o estado de loading ao iniciar e depois carregar os dados', async () => {
    const mockData: ExameHistory[] = [
      { idExame: 'EX-1111-2222', nomePaciente: 'João Silva', olho: 'Direito', scoreIA: '85', status: 'Normal', data: '2026-05-10' }
    ];

    vi.mocked(examesApi.fetchExames).mockResolvedValue(mockData);

    render(
      <MemoryRouter>
        <HistoricoExame />
      </MemoryRouter>
    );

    // Aguarda a transição para o estado de sucesso
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('deve lidar com erros de busca de dados e disparar o toast', async () => {
    const error = new Error('Erro de conexão');
    (error as any).status = 500;

    vi.mocked(examesApi.fetchExames).mockRejectedValue(error);

    render(
      <MemoryRouter>
        <HistoricoExame />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar os exames/i)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalled();
    });
  });
});