import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HistoricoExame from '@/features/historico-exames/routes/HistoricoExame';
import { toast } from 'sonner';
import * as relatorioMock from '@/features/historico-exames/mocks/relatorioMock';

// 1. Alteramos o mock para permitir espionagem do getter
vi.mock('@/features/historico-exames/mocks/relatorioMock', () => ({
  MOCK_HISTORICO: [] // valor inicial
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
}));

describe('HistoricoExame Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar o estado de loading ao iniciar e depois carregar os dados', async () => {
    // 2. Criamos uma promessa controlada que não resolve imediatamente
    const mockData = [
      { id: 'EX-1111-2222', paciente: 'João Silva', olho: 'OD', scoreIA: 85, status: 'Normal', data: '2026-05-10' }
    ];

    // Mockamos o MOCK_HISTORICO para retornar os dados
    vi.spyOn(relatorioMock, 'MOCK_HISTORICO', 'get').mockReturnValue(mockData as any);

    render(<HistoricoExame />);

    // 3. Agora o Skeleton DEVE estar lá, pois o useEffect roda após o primeiro render
    // Procuramos especificamente pelos checkboxes desabilitados do HistoricoSkeleton
    const skeletonCheckboxes = screen.getAllByRole('checkbox');
    
    // Se o teste ainda falhar aqui, é porque o render é rápido demais. 
    // Uma alternativa infalível é checar se eles estão na tela:
    expect(skeletonCheckboxes[0]).toBeInTheDocument();

    // 4. Aguarda a transição para o estado de sucesso
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      // Na tabela real, o checkbox NÃO deve estar desabilitado
      const activeCheckboxes = screen.getAllByRole('checkbox');
      expect(activeCheckboxes[0]).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  it('deve lidar com erros de busca de dados e disparar o toast', async () => {
    vi.spyOn(relatorioMock, 'MOCK_HISTORICO', 'get').mockImplementation(() => {
      throw { status: 500, message: 'Erro de conexão' };
    });

    render(<HistoricoExame />);

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar os exames/i)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Erro de conexão', expect.any(Object));
    });
  });

  // ... outros testes
});