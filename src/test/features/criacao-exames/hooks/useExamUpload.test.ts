import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, type Mock } from 'vitest';
import { useExamUpload } from '@/features/criacao-exames/hooks/useExamUpload';
import { validateFile } from '@/utils/validators/file';
import { toast } from 'sonner';

// Mock das dependências externas
vi.mock('@/utils/validators/file', () => ({
  validateFile: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

describe('useExamUpload Hook', () => {
  const mockFile = new File(['(fake-data)'], 'retina.jpg', { type: 'image/jpeg' });
  const mockFile2 = new File(['(fake-data-2)'], 'retina2.jpg', { type: 'image/jpeg' });

  beforeAll(() => {
    
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url') as any;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com o array de imagens vazio', () => {
    const { result } = renderHook(() => useExamUpload());
    expect(result.current.imagens).toEqual([]);
  });

  it('deve adicionar uma imagem com sucesso se passar na validação', () => {
    (validateFile as Mock).mockReturnValue(null); 
    const { result } = renderHook(() => useExamUpload());

    act(() => {
      result.current.handleImageChange(mockFile, 'OD');
    });

    expect(validateFile).toHaveBeenCalledWith(mockFile);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    
    expect(result.current.imagens).toHaveLength(1);
    expect(result.current.imagens[0]).toEqual({
      file: mockFile,
      lateralidade: 'OD',
      preview: 'blob:mock-preview-url',
    });
  });

  it('deve exibir um toast de erro e bloquear o upload se a validação falhar', () => {
    (validateFile as Mock).mockReturnValue('Formato não suportado');
    const { result } = renderHook(() => useExamUpload());

    act(() => {
      result.current.handleImageChange(mockFile, 'OE');
    });

    // Valida se o toast foi chamado e o estado não foi alterado
    expect(toast.error).toHaveBeenCalledWith('Formato não suportado');
    expect(result.current.imagens).toHaveLength(0);
  });

  it('deve substituir a imagem caso a mesma lateralidade já exista', () => {
    (validateFile as Mock).mockReturnValue(null);
    const { result } = renderHook(() => useExamUpload());

    // Adiciona primeira imagem OD
    act(() => { result.current.handleImageChange(mockFile, 'OD'); });
    expect(result.current.imagens[0].file.name).toBe('retina.jpg');

    // Tenta adicionar outra imagem também no OD usando o mockFile2
    act(() => { result.current.handleImageChange(mockFile2, 'OD'); });

    // O array não deve crescer, deve apenas substituir a posição do OD
    expect(result.current.imagens).toHaveLength(1);
    expect(result.current.imagens[0].file.name).toBe('retina2.jpg');
  });

  it('deve manter imagens diferentes (OD e OE) no mesmo array', () => {
    (validateFile as Mock).mockReturnValue(null);
    const { result } = renderHook(() => useExamUpload());

    act(() => {
      result.current.handleImageChange(mockFile, 'OD');
      // Usa o mockFile2 para o olho esquerdo
      result.current.handleImageChange(mockFile2, 'OE');
    });

    expect(result.current.imagens).toHaveLength(2);
    expect(result.current.imagens.map(img => img.lateralidade)).toEqual(['OD', 'OE']);
  });

  it('deve remover a imagem da lateralidade específica caso receba null', () => {
    (validateFile as Mock).mockReturnValue(null);
    const { result } = renderHook(() => useExamUpload());

    // Preenche ambos os lados
    act(() => {
      result.current.handleImageChange(mockFile, 'OD');
      result.current.handleImageChange(mockFile2, 'OE');
    });
    expect(result.current.imagens).toHaveLength(2);

    // Remove apenas o OD
    act(() => {
      result.current.handleImageChange(null, 'OD');
    });

    expect(result.current.imagens).toHaveLength(1);
    expect(result.current.imagens[0].lateralidade).toBe('OE'); // Restou apenas o OE
  });
});