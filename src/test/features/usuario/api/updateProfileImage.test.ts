import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { api } from '@/shared/api';
import { updateProfileImage } from '@/features/usuario/api/updateProfileImage';

vi.mock('@/shared/api', () => ({
  api: {
    patch: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn(),
  },
}));

describe('updateProfileImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve enviar a imagem e retornar response.data', async () => {
    const mockResponse = {
      data: {
        message: 'Imagem atualizada com sucesso',
      },
    };

    const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' });

    vi.mocked(api.patch).mockResolvedValue(mockResponse);

    const result = await updateProfileImage(file);

    expect(api.patch).toHaveBeenCalledTimes(1);

    const [url, formData, config] = vi.mocked(api.patch).mock.calls[0];

    expect(url).toBe('/api/usuarios/imagem');
    expect(formData).toBeInstanceOf(FormData);
    expect(config).toEqual({
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    expect(result).toEqual(mockResponse.data);
  });

  it('deve lançar erro com a mensagem da API quando for AxiosError', async () => {
    const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' });

    const axiosError = {
      response: {
        data: {
          message: 'Formato de imagem inválido.',
        },
      },
    };

    vi.mocked(api.patch).mockRejectedValue(axiosError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(updateProfileImage(file)).rejects.toThrow(
      'Formato de imagem inválido.'
    );
  });

  it('deve lançar mensagem padrão quando for AxiosError sem message', async () => {
    const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' });

    const axiosError = {
      response: {
        data: {},
      },
    };

    vi.mocked(api.patch).mockRejectedValue(axiosError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(updateProfileImage(file)).rejects.toThrow(
      'Erro ao enviar imagem.'
    );
  });

  it('deve lançar erro genérico quando não for AxiosError', async () => {
    const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' });

    vi.mocked(api.patch).mockRejectedValue(new Error('Erro desconhecido'));
    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    await expect(updateProfileImage(file)).rejects.toThrow(
      'Erro ao atualizar imagem de perfil.'
    );
  });
});
