import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalCompartilhar } from '@/features/historico-exames/components/ModalCompartilhar';
import * as authClient from '@/lib/auth-client';
import { toast } from 'sonner';

import { 
  useSearchMedicos, 
  useGenerateShareLink, 
  useGetExamShares, 
  useRevokeShare 
} from '@/features/historico-exames/hooks/useShareExam';

// Mocks
vi.mock('@/features/historico-exames/hooks/useShareExam', () => ({
  useSearchMedicos: vi.fn(),
  useGenerateShareLink: vi.fn(),
  useGetExamShares: vi.fn(),
  useRevokeShare: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn()
}));

describe('ModalCompartilhar Component', () => {
  const mockExamId = 'exam-123';
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { email: 'logado@retinascan.local' } }
    } as any);

    vi.mocked(useSearchMedicos).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useGenerateShareLink).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(useGetExamShares).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useRevokeShare).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);

    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    window.confirm = vi.fn();
  });

  it('deve renderizar o modal corretamente quando aberto', () => {
    render(<ModalCompartilhar isOpen={true} onClose={mockOnClose} examId={mockExamId} />);
    
    expect(screen.getByText('Gerenciamento de Acesso Controlado')).toBeInTheDocument();
    expect(screen.getByText('Nenhum link ativo para este exame. Os links gerados aparecerão listados aqui.')).toBeInTheDocument();
  });

  it('deve gerar o link de compartilhamento e exibir a tela de sucesso', async () => {
    const medicosMock = [{ id: '1', nomeCompleto: 'Dr. Teste', email: 'teste@retinascan.local', crm: '111' }];
    vi.mocked(useSearchMedicos).mockReturnValue({ data: medicosMock, isLoading: false } as any);
    
    const mutateAsyncMock = vi.fn().mockResolvedValue({});
    vi.mocked(useGenerateShareLink).mockReturnValue({ mutateAsync: mutateAsyncMock, isPending: false } as any);

    render(<ModalCompartilhar isOpen={true} onClose={mockOnClose} examId={mockExamId} />);

    fireEvent.click(screen.getByText('Dr. Teste'));
    fireEvent.click(screen.getByRole('button', { name: /Gerar Link/i }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        emailDestino: 'teste@retinascan.local',
        expiraEm: expect.any(String)
      });
      expect(toast.success).toHaveBeenCalledWith('Exame compartilhado com sucesso!');
      expect(screen.getByText('Link Direto Gerado')).toBeInTheDocument();
    });
  });

  it('deve revogar acesso quando o usuário confirmar no alerta nativo', async () => {
    const listagemMock = [
      { id: 'share-1', medicoDestino: { nomeCompleto: 'Dr. Apagado' }, expiraEm: null, criadoEm: '' }
    ];
    vi.mocked(useGetExamShares).mockReturnValue({ data: listagemMock, isLoading: false } as any);
    
    const revokeMock = vi.fn().mockResolvedValue({});
    vi.mocked(useRevokeShare).mockReturnValue({ mutateAsync: revokeMock, isPending: false } as any);
    
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<ModalCompartilhar isOpen={true} onClose={mockOnClose} examId={mockExamId} />);

    fireEvent.click(screen.getByTitle('Revogar Acesso'));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(revokeMock).toHaveBeenCalledWith('share-1');
      expect(toast.success).toHaveBeenCalledWith('Acesso revogado com sucesso!');
    });
  });

  it('não deve revogar acesso se o usuário cancelar o alerta', async () => {
    const listagemMock = [{ id: 'share-1', medicoDestino: { nomeCompleto: 'Dr. Apagado' }, expiraEm: null, criadoEm: '' }];
    vi.mocked(useGetExamShares).mockReturnValue({ data: listagemMock, isLoading: false } as any);
    
    const revokeMock = vi.fn();
    vi.mocked(useRevokeShare).mockReturnValue({ mutateAsync: revokeMock, isPending: false } as any);
    
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<ModalCompartilhar isOpen={true} onClose={mockOnClose} examId={mockExamId} />);

    fireEvent.click(screen.getByTitle('Revogar Acesso'));

    expect(revokeMock).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});