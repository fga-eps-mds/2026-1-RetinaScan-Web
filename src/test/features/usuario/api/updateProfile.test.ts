import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { api } from '@/shared/api';
import { updateProfile } from '@/features/usuario/api/updateProfile';

vi.mock('@/shared/api', () => ({
  api: {
    put: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn(),
  },
}));

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar os dados quando a requisição for bem-sucedida', async () => {
    const mockResponse = {
      data: {
        message: 'Perfil atualizado com sucesso',
      },
    };

    vi.mocked(api.put).mockResolvedValue(mockResponse);

    const result = await updateProfile({
      nomeCompleto: 'Gustavo Costa',
    });

    expect(api.put).toHaveBeenCalledWith('/api/usuarios', {
      nomeCompleto: 'Gustavo Costa',
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('deve lançar erro com mensagens dos fields quando a API retornar fields', async () => {
    const axiosError = {
      response: {
        data: {
          fields: [
            { message: 'Email inválido' },
            { message: 'Senha muito curta' },
          ],
        },
      },
    };

    vi.mocked(api.put).mockRejectedValue(axiosError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(
      updateProfile({
        email: 'email-invalido',
      })
    ).rejects.toThrow('Email inválido\nSenha muito curta');
  });

  it('deve lançar erro com responseData.message quando existir', async () => {
    const axiosError = {
      response: {
        data: {
          message: 'Email já cadastrado',
        },
      },
    };

    vi.mocked(api.put).mockRejectedValue(axiosError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(
      updateProfile({
        email: 'teste@teste.com',
      })
    ).rejects.toThrow('Email já cadastrado');
  });

  it('deve lançar erro padrão quando não for AxiosError', async () => {
    vi.mocked(api.put).mockRejectedValue(new Error('Erro qualquer'));
    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    await expect(
      updateProfile({
        nomeCompleto: 'Teste',
      })
    ).rejects.toThrow('Erro ao atualizar perfil.');
  });

  it('deve lançar erro padrão quando AxiosError não tiver fields nem message', async () => {
    const axiosError = {
      response: {
        data: {},
      },
    };

    vi.mocked(api.put).mockRejectedValue(axiosError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(
      updateProfile({
        nomeCompleto: 'Teste',
      })
    ).rejects.toThrow('Erro ao atualizar perfil.');
  });
});
