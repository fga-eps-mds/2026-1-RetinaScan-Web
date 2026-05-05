import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUploadBox } from '@/features/exames/components/CardUpload';
import { vi, describe, it, expect, beforeAll } from 'vitest';

//  Mock do fileReader
beforeAll(() => {
  class MockFileReader {
    result = 'data:image/png;base64,test';
    onloadend: (() => void) | null = null;

    readAsDataURL() {
      if (this.onloadend) {
        this.onloadend();
      }
    }
  }

  globalThis.FileReader = MockFileReader as any;
});

describe('ImageUploadBox', () => {
  
  it('deve renderizar o label corretamente', () => {
    render(
      <ImageUploadBox 
        label="Olho esquerdo (OE)" 
        side="OE" 
        onImageChange={vi.fn()} 
      />
    );

    expect(screen.getByText(/Olho esquerdo/)).toBeInTheDocument();
  });

  it('deve chamar onImageChange ao selecionar imagem', () => {
    const mockOnChange = vi.fn();

    render(
      <ImageUploadBox 
        label="Teste" 
        side="OE" 
        onImageChange={mockOnChange} 
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(mockOnChange).toHaveBeenCalledWith(file);
  });

  it('deve gerar preview da imagem após upload', async () => {
    render(
      <ImageUploadBox 
        label="Teste" 
        side="OE" 
        onImageChange={vi.fn()} 
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    const image = await screen.findByRole('img');

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'data:image/png;base64,test');
  });

  it('deve mostrar botão de remover após upload', async () => {
    render(
      <ImageUploadBox 
        label="Teste" 
        side="OE" 
        onImageChange={vi.fn()} 
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    const removeButton = await screen.findByRole('button');

    expect(removeButton).toBeInTheDocument();
  });

  it('deve remover imagem ao clicar no botão', async () => {
    const mockOnChange = vi.fn();

    render(
      <ImageUploadBox 
        label="Teste" 
        side="OE" 
        onImageChange={mockOnChange} 
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    const removeButton = await screen.findByRole('button');

    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('deve aceitar upload via drag and drop', () => {
    const mockOnChange = vi.fn();

    render(
      <ImageUploadBox 
        label="Teste" 
        side="OE" 
        onImageChange={mockOnChange} 
      />
    );

    const dropArea = screen
      .getByText(/Enviar ou arrastar imagem/i)
      .closest('div');

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.drop(dropArea!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockOnChange).toHaveBeenCalledWith(file);
  });

  it('não deve aceitar arquivos que não são imagem', () => {
    const mockOnChange = vi.fn();

    render(
      <ImageUploadBox 
        label="Teste" 
        side="OE" 
        onImageChange={mockOnChange} 
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

});