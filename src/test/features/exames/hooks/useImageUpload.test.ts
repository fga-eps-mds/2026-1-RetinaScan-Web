import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useImageUpload } from '@/features/exames/hooks/useImageUpload';
import { toast } from 'sonner';
import * as fileValidators from '@/utils/validators/file';

// Mock do Sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

// Mock do validador de arquivo
vi.mock('@/utils/validators/file', () => ({
  validateFile: vi.fn(),
}));

describe('useImageUpload', () => {
  const onImageChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve processar um arquivo válido e gerar preview', async () => {
    // Simula que o arquivo passou na validação
    vi.mocked(fileValidators.validateFile).mockReturnValue(null);
    
    const { result } = renderHook(() => useImageUpload(onImageChangeMock));
    const file = new File(['conteudo'], 'foto.png', { type: 'image/png' });

    await act(async () => {
      result.current.handleFileChange(file);
    });

    // Verifica se chamou a função externa
    expect(onImageChangeMock).toHaveBeenCalledWith(file);
    
    // Aguarda o FileReader processar para verificar o preview
    await waitFor(() => {
      expect(result.current.preview).toContain('data:image/png;base64');
    });
  });

  it('não deve processar arquivo se a validação falhar', async () => {
    // Simula um erro de validação
    const errorMsg = 'O arquivo excede o limite de 10MB.';
    vi.mocked(fileValidators.validateFile).mockReturnValue(errorMsg);

    const { result } = renderHook(() => useImageUpload(onImageChangeMock));
    const file = new File([''], 'grande.png', { type: 'image/png' });

    await act(async () => {
      result.current.handleFileChange(file);
    });

    // O toast de erro deve ser chamado
    expect(toast.error).toHaveBeenCalledWith(errorMsg);
    
    // As funções de sucesso NÃO devem ser chamadas
    expect(onImageChangeMock).not.toHaveBeenCalled();
    expect(result.current.preview).toBeNull();
  });

  it('deve limpar o estado ao chamar removeImage', () => {
    const { result } = renderHook(() => useImageUpload(onImageChangeMock));

    act(() => {
      result.current.removeImage();
    });

    expect(result.current.preview).toBeNull();
    expect(onImageChangeMock).toHaveBeenCalledWith(null);
  });
});