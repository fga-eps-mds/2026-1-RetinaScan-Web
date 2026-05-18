import { describe, it, expect, vi } from 'vitest';
import { searchMedicos } from '@/features/admin/api/searchMedicos'
import { api } from '@/shared/api';

// Criamos um mock do cliente de API compartilhado
vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('searchMedicos API', () => {
  it('deve efetuar a requisição GET com os parâmetros corretos e retornar os dados', async () => {
    const mockApiResponse = {
      message: 'Médicos encontrados com sucesso.',
      data: [{ id: '1', nomeCompleto: 'Dr. Teste', crm: '12345', email: 'teste@retinascan.com' }],
    };

    // Simulamos que o axios resolveu a promessa com o formato esperado
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockApiResponse });

    const params = { nome: 'Teste', crm: '12345', email: 'teste@retinascan.com' };
    
    // Executamos a função
    const resultado = await searchMedicos(params);

    // Assert 1: Garante que o endpoint e os parâmetros de query string foram repassados perfeitamente
    expect(api.get).toHaveBeenCalledWith('/api/medicos/search', { params });

    // Assert 2: Garante que a função extraiu e retornou o .data da resposta HTTP
    expect(resultado).toEqual(mockApiResponse);
  });
});