import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UploadExame from '@/features/exames/routes/UploudExame';
import { toast } from 'sonner';

// mock do useParams
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
  };
});

// mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UploadExame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os dois uploads', () => {
    render(<UploadExame />);

    expect(screen.getByText(/Olho esquerdo/i)).toBeInTheDocument();
    expect(screen.getByText(/Olho direito/i)).toBeInTheDocument();
  });

  it('mostra erro se tentar enviar sem imagem', async () => {
    const user = userEvent.setup();

    render(<UploadExame />);

    await user.click(
      screen.getByRole('button', { name: /Enviar para Análise/i })
    );

    expect(toast.error).toHaveBeenCalledWith(
      'Selecione pelo menos uma imagem para análise.'
    );
  });

  it('envia com sucesso quando tem imagem', async () => {
    const user = userEvent.setup();

    render(<UploadExame />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    await user.upload(input, file);

    await user.click(
      screen.getByRole('button', { name: /Enviar para Análise/i })
    );

    expect(toast.success).toHaveBeenCalledWith(
      'Imagens enviadas para processamento!'
    );
  });
});