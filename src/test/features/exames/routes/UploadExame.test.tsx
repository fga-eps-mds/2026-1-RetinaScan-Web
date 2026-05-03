import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UploadExame from '@/features/exames/routes/UploadExame';
import { toast } from 'sonner';
import * as validator from '@/utils/validators/exam';
import { api } from '@/shared/api';

const mocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
  useParams: vi.fn(() => ({ id: '550e8400-e29b-41d4-a716-446655440000' })),
}));

// Mock do api
vi.mock('@/shared/api', () => ({
  api: {
    post: mocks.apiPost,
  },
}));

// Mock do useParams do react-router
vi.mock('react-router', () => ({
  useParams: mocks.useParams,
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
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-gray-400');
  });

  it('deve exibir mensagem de erro quando o ID do exame for inválido', () => {
    vi.mocked(validator.isValidExamId).mockReturnValueOnce(false);

    render(<UploadExame />);

    expect(
      screen.getByText(/Erro: Sessão de exame inválida ou ID não encontrado/i)
    ).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    expect(button).toBeDisabled();
  });

  it('deve habilitar o botão após upload de imagem e enviar com sucesso', async () => {
    const user = userEvent.setup();
    mocks.apiPost.mockResolvedValue({ data: { success: true } });

    render(<UploadExame />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput) throw new Error('Input de arquivo não encontrado');

    const file = new File(['conteudo'], 'olho.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    expect(button).not.toBeDisabled();

    await user.click(button);

    await waitFor(() => {
      expect(mocks.apiPost).toHaveBeenCalledWith(
        '/api/exams/550e8400-e29b-41d4-a716-446655440000/images',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Imagens enviadas para processamento!');
  });

  it('deve enviar ambos os olhos quando ambas as imagens forem carregadas', async () => {
    const user = userEvent.setup();
    mocks.apiPost.mockResolvedValue({ data: { success: true } });

    render(<UploadExame />);

    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    expect(fileInputs.length).toBe(2);

    const fileOE = new File(['conteudo-oe'], 'olho-esquerdo.png', { type: 'image/png' });
    const fileOD = new File(['conteudo-od'], 'olho-direito.png', { type: 'image/png' });

    await user.upload(fileInputs[0], fileOE);
    await user.upload(fileInputs[1], fileOD);

    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    await user.click(button);

    await waitFor(() => {
      const formDataCall = mocks.apiPost.mock.calls[0][1];
      expect(formDataCall).toBeInstanceOf(FormData);
    });

    expect(toast.success).toHaveBeenCalled();
  });

  it('deve mostrar estado de carregamento durante upload', async () => {
    const user = userEvent.setup();
    mocks.apiPost.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100)));

    render(<UploadExame />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['conteudo'], 'olho.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    await user.click(button);

    expect(screen.getByRole('button', { name: /Enviando\.\.\./i })).toBeInTheDocument();
  });

  it('deve exibir erro quando upload falha', async () => {
    const user = userEvent.setup();
    mocks.apiPost.mockRejectedValue({ 
      response: { data: { message: 'Imagem inválida' } } 
    });

    render(<UploadExame />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['conteudo'], 'olho.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Imagem inválida');
    });
  });

  it('deve usar a mensagem de erro do objeto Error quando a API falha sem response', async () => {
    const user = userEvent.setup();
    mocks.apiPost.mockRejectedValue(new Error('Falha inesperada'));

    render(<UploadExame />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['conteudo'], 'olho.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /Enviar para Análise/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Falha inesperada');
    });
  });

  it('deve limpar o estado de envio após sucesso', async () => {
    const user = userEvent.setup();
    mocks.apiPost.mockResolvedValue({ data: { success: true } });

    render(<UploadExame />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['conteudo'], 'olho.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    const button = screen.getByRole('button', { name: /Enviar para Análise/i });
    expect(button).not.toBeDisabled();

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Enviar para Análise/i })).toBeDisabled();
    });
  });
});