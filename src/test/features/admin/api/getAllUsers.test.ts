import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { getAllUsers } from '@/features/admin/api/getAllUsers';

vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar a lista de usuários quando a chamada for bem-sucedida', async () => {
    const mockUsers = [
      { id: '1', nome: 'User One' },
      { id: '2', nome: 'User Two' },
    ];

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUsers });

    const result = await getAllUsers();

    expect(api.get).toHaveBeenCalledWith('/api/usuarios');
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUsers);
  });

  it('deve propagar o erro quando a API falhar', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(
      new Error('Erro ao buscar usuários')
    );

    await expect(getAllUsers()).rejects.toThrow('Erro ao buscar usuários');
  });
});
