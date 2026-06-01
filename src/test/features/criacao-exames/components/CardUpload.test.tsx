import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'; 
import { CardUpload } from '@/features/criacao-exames/components/CardUpload';
import { useImageUpload } from '@/features/criacao-exames/hooks/useImageUpload';

vi.mock('@/features/criacao-exames/hooks/useImageUpload');

describe('CardUpload', () => {
  const mockOnImageChange = vi.fn();
  
  // Funções simuladas que o hook retornaria
  const mockHandleFileChange = vi.fn();
  const mockHandleDrop = vi.fn();
  const mockRemoveImage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup padrão do mock do hook (estado vazio/sem imagem)
    (useImageUpload as Mock).mockReturnValue({
      preview: null,
      handleFileChange: mockHandleFileChange,
      handleDrop: mockHandleDrop,
      removeImage: mockRemoveImage,
    });
  });

  it('deve renderizar o estado inicial (empty state) corretamente', () => {
    render(<CardUpload label="Olho Direito (OD)" side="OD" onImageChange={mockOnImageChange} />);
    
    // Valida a presença dos textos do estado vazio
    expect(screen.getByText('Olho Direito (OD)')).toBeDefined();
    expect(screen.getByText('Enviar ou arrastar imagem')).toBeDefined();
    expect(screen.getByText('Selecione imagem')).toBeDefined();
    
    // Verifica se a imagem de preview NÃO está renderizada
    expect(screen.queryByAltText('Olho Direito (OD)')).toBeNull();
  });

  it('deve renderizar o preview da imagem quando existir e ocultar o empty state', () => {
    // Altera o mock para simular o retorno de um base64 de imagem
    (useImageUpload as Mock).mockReturnValue({
      preview: 'data:image/png;base64,fake-image-data',
      handleFileChange: mockHandleFileChange,
      handleDrop: mockHandleDrop,
      removeImage: mockRemoveImage,
    });

    render(<CardUpload label="Olho Esquerdo (OE)" side="OE" onImageChange={mockOnImageChange} />);
    
    // Verifica a renderização da tag <img> com os atributos corretos
    const imageElement = screen.getByAltText('Olho Esquerdo (OE)');
    expect(imageElement).toBeDefined();
    expect(imageElement.getAttribute('src')).toBe('data:image/png;base64,fake-image-data');
    
    // Empty state não deve aparecer
    expect(screen.queryByText('Enviar ou arrastar imagem')).toBeNull();
  });

  it('deve acionar removeImage ao clicar no botão de exclusão da miniatura', () => {
    // Simula estado com preview para expor o botão de fechar (X)
    (useImageUpload as Mock).mockReturnValue({
      preview: 'data:image/png;base64,fake-image-data',
      handleFileChange: mockHandleFileChange,
      handleDrop: mockHandleDrop,
      removeImage: mockRemoveImage,
    });

    render(<CardUpload label="Olho Direito (OD)" side="OD" onImageChange={mockOnImageChange} />);
    
    // O botão de remover é o único <button> renderizado quando há preview
    const removeBtn = screen.getByRole('button');
    fireEvent.click(removeBtn);

    // Valida se o evento de clique alcançou o hook
    expect(mockRemoveImage).toHaveBeenCalledTimes(1);
  });

  it('deve capturar o arquivo do input e repassar para handleFileChange', () => {
    render(<CardUpload label="Olho Direito (OD)" side="OD" onImageChange={mockOnImageChange} />);
    
    // O input type="file" fica invisível (hidden) envolto em uma label
    const fileInput = screen.getByLabelText(/Selecione imagem/i);
    
    // Criação de um objeto File fictício, emulando um DICOM
    const file = new File(['(fake-binary-data)'], 'retina.dcm', { type: 'application/dicom' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Valida se a UI delegou o arquivo corretamente para o hook processar
    expect(mockHandleFileChange).toHaveBeenCalledTimes(1);
    expect(mockHandleFileChange).toHaveBeenCalledWith(file);
  });
});