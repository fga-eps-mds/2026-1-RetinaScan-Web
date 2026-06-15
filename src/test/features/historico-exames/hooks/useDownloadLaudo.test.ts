import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useDownloadLaudo } from '@/features/historico-exames/hooks/useDownloadLaudo';
import { downloadLaudoApi } from '@/features/historico-exames/api/downloadLaudo';
import { toast } from 'sonner';

// 1. Mocks das dependências externas
vi.mock('@/features/historico-exames/api/downloadLaudo', () => ({
  downloadLaudoApi: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useDownloadLaudo', () => {
  // Setup dos mocks do DOM e Window
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();
  const mockLink = {
    href: '',
    setAttribute: vi.fn(),
    click: vi.fn(),
    parentNode: { removeChild: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do window.URL
    window.URL.createObjectURL = mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-url');
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    // Guarda as funções originais do DOM
    const originalCreateElement = document.createElement.bind(document);
    const originalAppendChild = document.body.appendChild.bind(document.body);

    // Mock condicional: devolve o mockLink só para tag 'a', e deixa o React criar o resto
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'a') return mockLink as any;
      return originalCreateElement(tagName);
    });

    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      if (node === mockLink as any) return node;
      return originalAppendChild(node);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve realizar o download com sucesso e disparar toast de sucesso', async () => {
    const mockBlob = new Blob(['conteudo'], { type: 'application/pdf' });
    vi.mocked(downloadLaudoApi).mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useDownloadLaudo());

    expect(result.current.isDownloading).toBe(false);

    // Executa a função
    await act(async () => {
      await result.current.handleDownload('EX-123', 'laudo.pdf');
    });

    // Validações da API
    expect(downloadLaudoApi).toHaveBeenCalledWith('EX-123');

    // Validações do DOM e manipulação de arquivo
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'laudo.pdf');
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-url');

    // Validações de UI (Toast e Estado)
    expect(toast.success).toHaveBeenCalledWith('Download concluído com sucesso!');
    expect(result.current.isDownloading).toBe(false);
  });

  it('deve disparar toast de erro se a API falhar', async () => {
    vi.mocked(downloadLaudoApi).mockRejectedValue(new Error('Falha na API'));

    const { result } = renderHook(() => useDownloadLaudo());

    await act(async () => {
      await result.current.handleDownload('EX-123', 'laudo.pdf');
    });

    // Garante que o fluxo de sucesso não rodou
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockLink.click).not.toHaveBeenCalled();

    // Valida o tratamento de erro
    expect(toast.error).toHaveBeenCalledWith('Erro ao gerar o relatório. Tente novamente.');
    expect(result.current.isDownloading).toBe(false);
  });
});