import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, type Mock } from 'vitest';
import { useImageUpload } from '@/features/criacao-exames/hooks/useImageUpload';
import { validateFile } from '@/utils/validators/file';
import { toast } from 'sonner';

// Mocks das validações e notificações
vi.mock('@/utils/validators/file', () => ({
  validateFile: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

describe('useImageUpload Hook', () => {
  const mockOnImageChange = vi.fn();
  const mockFile = new File(['(fake-data)'], 'retina.jpg', { type: 'image/jpeg' });

  beforeAll(() => {
    // CORREÇÃO: Criação de uma classe falsa (Mock) para suportar a chamada "new FileReader()"
    class MockFileReader {
      result: string | null = null;
      onloadend: (() => void) | null = null;

      readAsDataURL() {
        this.result = 'data:image/jpeg;base64,fake-base64-string';
        // Simula o disparo do evento onloadend imediatamente após a leitura
        if (this.onloadend) {
          this.onloadend();
        }
      }
    }
    
    // Injeta a classe falsa globalmente no ambiente de teste do Node/JSDOM
    globalThis.FileReader = MockFileReader as any;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com o preview nulo', () => {
    const { result } = renderHook(() => useImageUpload(mockOnImageChange));
    expect(result.current.preview).toBeNull();
  });

  it('deve processar o arquivo, gerar preview e notificar o pai caso seja válido', () => {
    (validateFile as Mock).mockReturnValue(null); // Arquivo válido
    
    const { result } = renderHook(() => useImageUpload(mockOnImageChange));

    act(() => {
      result.current.handleFileChange(mockFile);
    });

    // Valida se o validador foi chamado
    expect(validateFile).toHaveBeenCalledWith(mockFile);
    
    // Valida se a string base64 da classe MockFileReader foi salva no estado
    expect(result.current.preview).toBe('data:image/jpeg;base64,fake-base64-string');
    
    // Valida se a callback do pai recebeu o arquivo correto
    expect(mockOnImageChange).toHaveBeenCalledWith(mockFile);
    expect(mockOnImageChange).toHaveBeenCalledTimes(1);
  });

  it('deve disparar erro, não gerar preview e não notificar o pai caso seja inválido', () => {
    (validateFile as Mock).mockReturnValue('Tamanho máximo excedido');
    
    const { result } = renderHook(() => useImageUpload(mockOnImageChange));

    act(() => {
      result.current.handleFileChange(mockFile);
    });

    // Valida se a UI notificou o usuário
    expect(toast.error).toHaveBeenCalledWith('Tamanho máximo excedido');
    
    // Garante que o fluxo foi interrompido e os estados continuam intocados
    expect(result.current.preview).toBeNull();
    expect(mockOnImageChange).not.toHaveBeenCalled();
  });

  it('deve limpar o preview e notificar o pai com null ao acionar removeImage', () => {
    (validateFile as Mock).mockReturnValue(null);
    const { result } = renderHook(() => useImageUpload(mockOnImageChange));

    // Primeiro adiciona uma imagem
    act(() => {
      result.current.handleFileChange(mockFile);
    });
    expect(result.current.preview).not.toBeNull();

    // Depois remove
    act(() => {
      result.current.removeImage();
    });

    expect(result.current.preview).toBeNull();
    // Verifica a última chamada do mockOnImageChange (no caso, a chamada de remoção)
    expect(mockOnImageChange).toHaveBeenLastCalledWith(null);
  });

  it('deve extrair o arquivo de um evento DragEvent e processá-lo', () => {
    (validateFile as Mock).mockReturnValue(null);
    const { result } = renderHook(() => useImageUpload(mockOnImageChange));

    const mockPreventDefault = vi.fn();
    
    // Simula a estrutura de um evento onDrop do React
    const mockDropEvent = {
      preventDefault: mockPreventDefault,
      dataTransfer: {
        files: [mockFile],
      },
    } as unknown as React.DragEvent<HTMLDivElement>;

    act(() => {
      result.current.handleDrop(mockDropEvent);
    });

    // Garante que o comportamento padrão do navegador foi bloqueado
    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
    
    // Garante que o arquivo do drop foi processado com sucesso
    expect(result.current.preview).toBe('data:image/jpeg;base64,fake-base64-string');
    expect(mockOnImageChange).toHaveBeenCalledWith(mockFile);
  });
});