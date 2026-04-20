import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { createUser } from '@/features/admin/api/createUser';

vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('createUser', () => {
  const mockData = {
    nome: 'John Doe',
    email: 'john@example.com',
    tipoPerfil: 'admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a API com os parâmetros corretos e retornar os dados', async () => {
    const mockResponse = { data: { id: '1', ...mockData } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await createUser(mockData as any);

    expect(api.post).toHaveBeenCalledWith('/api/usuarios', mockData);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse.data);
  });

  it('deve lançar erro quando a chamada da API falha', async () => {
    const error = new Error('Network Error');
    vi.mocked(api.post).mockRejectedValueOnce(error);

    await expect(createUser(mockData as any)).rejects.toThrow('Network Error');
  });
});
