import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadStep } from '@/features/criacao-exames/components/UploadStep';

// Mock do CardUpload: isola o teste renderizando apenas botões simples para simular a ação de upload
vi.mock('@/features/criacao-exames/components/CardUpload', () => ({
  CardUpload: ({ label, side, onImageChange }: any) => (
    <div data-testid={`mock-card-${side}`}>
      <span>{label}</span>
      <button 
        data-testid={`trigger-upload-${side}`} 
        // Simula o hook interno chamando a função com um arquivo fictício
        onClick={() => onImageChange(new File([''], 'teste.dcm', { type: 'application/dicom' }))}
      >
        Upload {side}
      </button>
    </div>
  )
}));

describe('UploadStep', () => {
  const mockOnImageChange = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar os cards OD/OE e o botão desabilitado por padrão', () => {
    render(
      <UploadStep 
        canProceed={false} 
        isUploading={false} 
        onImageChange={mockOnImageChange} 
        onNext={mockOnNext} 
      />
    );

    // Valida os cards mockados
    expect(screen.getByTestId('mock-card-OD')).toBeDefined();
    expect(screen.getByTestId('mock-card-OE')).toBeDefined();

    // Valida o botão inicial
    const nextBtn = screen.getByRole('button', { name: /Continuar para Dados/i });
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('deve habilitar o botão quando canProceed for true', () => {
    render(
      <UploadStep 
        canProceed={true} 
        isUploading={false} 
        onImageChange={mockOnImageChange} 
        onNext={mockOnNext} 
      />
    );

    const nextBtn = screen.getByRole('button', { name: /Continuar para Dados/i });
    expect((nextBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('deve alterar o texto e desabilitar o botão quando isUploading for true', () => {
    render(
      <UploadStep 
        canProceed={true} // Mesmo podendo prosseguir, o upload bloqueia
        isUploading={true} 
        onImageChange={mockOnImageChange} 
        onNext={mockOnNext} 
      />
    );

    const loadingBtn = screen.getByRole('button', { name: /Processando imagens.../i });
    expect(loadingBtn).toBeDefined();
    expect((loadingBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('deve chamar onNext ao clicar no botão habilitado', () => {
    render(
      <UploadStep 
        canProceed={true} 
        isUploading={false} 
        onImageChange={mockOnImageChange} 
        onNext={mockOnNext} 
      />
    );

    const nextBtn = screen.getByRole('button', { name: /Continuar para Dados/i });
    fireEvent.click(nextBtn);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('deve injetar a lateralidade correta ao acionar onImageChange do card OD', () => {
    render(
      <UploadStep 
        canProceed={false} 
        isUploading={false} 
        onImageChange={mockOnImageChange} 
        onNext={mockOnNext} 
      />
    );

    // Simula o upload no card do Olho Direito
    fireEvent.click(screen.getByTestId('trigger-upload-OD'));

    expect(mockOnImageChange).toHaveBeenCalledTimes(1);
    // Valida se o parâmetro 'OD' foi anexado corretamente
    expect(mockOnImageChange).toHaveBeenCalledWith(expect.any(File), 'OD');
  });

  it('deve injetar a lateralidade correta ao acionar onImageChange do card OE', () => {
    render(
      <UploadStep 
        canProceed={false} 
        isUploading={false} 
        onImageChange={mockOnImageChange} 
        onNext={mockOnNext} 
      />
    );

    // Simula o upload no card do Olho Esquerdo
    fireEvent.click(screen.getByTestId('trigger-upload-OE'));

    expect(mockOnImageChange).toHaveBeenCalledTimes(1);
    // Valida se o parâmetro 'OE' foi anexado corretamente
    expect(mockOnImageChange).toHaveBeenCalledWith(expect.any(File), 'OE');
  });
});