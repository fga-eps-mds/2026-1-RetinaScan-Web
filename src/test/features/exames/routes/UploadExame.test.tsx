import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UploadExame from '@/features/exames/routes/UploudExame';
import { toast } from 'sonner';
import * as validator from '@/utils/validators/exam';

// Mock do useParams do react-router
vi.mock('react-router', () => ({
  useParams: () => ({ id: '123' }),
}));

// Mock do toast da biblioteca sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock do utilitário de validação
vi.mock('@/utils/validators/exam', () => ({
  isValidExamId: vi.fn(() => true),
}));

describe('UploadExame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os dois campos de upload e o cabeçalho', () => {
    render(<UploadExame />);

    expect(screen.getByText(/Novo Exame/i)).toBeInTheDocument();
    expect(screen.getByText(/Olho esquerdo \(OE\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Olho direito \(OD\)/i)).toBeInTheDocument();
  });

  it('deve manter o botão desabilitado se não houver imagens', () => {
    render(<UploadExame />);

    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    
    // Verifica se o atributo disabled está presente
    expect(button).toBeDisabled();
    // Verifica se a classe de estilo desabilitado foi aplicada
    expect(button).toHaveClass('bg-gray-400');
  });

  it('deve exibir mensagem de erro quando o ID do exame for inválido', () => {
    // Força o validador a retornar false para este teste específico
    vi.mocked(validator.isValidExamId).mockReturnValueOnce(false);

    render(<UploadExame />);

    expect(
      screen.getByText(/Erro: Sessão de exame inválida ou ID não encontrado/i)
    ).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    expect(button).toBeDisabled();
  });

  it('deve habilitar o botão e enviar com sucesso ao fazer upload de uma imagem', async () => {
    const user = userEvent.setup();
    render(<UploadExame />);

    // Buscamos o input de arquivo. Usamos Type Assertion 'as HTMLInputElement' para o TS
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (!fileInput) {
      throw new Error('Input de arquivo não encontrado no DOM');
    }

    const file = new File(['conteudo-da-imagem'], 'olho.png', { type: 'image/png' });

    // Simula o upload do arquivo
    await user.upload(fileInput, file);

    const button = screen.getByRole('button', { name: /Enviar para Análise/i });

    // O botão deve ser habilitado após o upload
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('bg-[#00b34d]');

    // Simula o clique
    await user.click(button);

    // Verifica se o toast de sucesso foi chamado
    expect(toast.success).toHaveBeenCalledWith('Imagens enviadas para processamento!');
  });
});