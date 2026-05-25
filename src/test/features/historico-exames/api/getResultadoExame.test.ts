import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getResultadoExame } from '@/features/historico-exames/api/getResultadoExame'; // Ajuste o caminho se necessário
import { api } from '@/shared/api';
import { resolveImageUrl } from '@/utils/resolveImageUrl/resolveImageUrl';

// Mock das dependências
vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock('@/utils/resolveImageUrl/resolveImageUrl', () => ({
  resolveImageUrl: vi.fn(),
}));

describe('getResultadoExame (Service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockApiResponse = {
    id: 'EX-123',
    status: 'CONCLUIDO',
    nomeCompleto: 'Maria Souza',
    cpf: '123.456.789-00',
    sexo: 'FEMININO',
    dtNascimento: '1980-05-20',
    dtHora: '2026-05-23T10:00:00.000Z',
    olho: 'AO',
    comorbidades: {
      diabetes: true,
      diabetesAnos: 5,
      diabetesUsoInsulina: false,
      diabetesControlado: true,
      hipertensao: false,
      hipertensaoControlada: false,
      altaMiopia: false,
      glaucoma: false,
      usoHidroxicloroquina: false,
      uveite: false,
      catarata: false,
      outrasComorbidades: false,
      outrasComorbidadesDescricao: null,
      qualidadeTecnicaDificuldade: false,
    },
    descricao: 'Exame de rotina',
    medico: {
      id: 'MED-1',
      nomeCompleto: 'Dr. Carlos',
    },
    imagens: [
      {
        id: 'IMG-1',
        lateralidadeOlho: 'OD',
        url: 'url-bruta-od.jpg',
        qualidadeImg: 'BOA',
        resultadoIa: {
          id: 'IA-1',
          predictedClass: 0,
          predictedLabel: 'normal',
          confidence: 0.99,
          probabilities: { normal: 0.99, alterado: 0.01 },
        },
      },
      {
        id: 'IMG-2',
        lateralidadeOlho: 'OE',
        url: 'url-bruta-oe.jpg',
        qualidadeImg: 'RUIM',
        resultadoIa: null, // Testando imagem sem resultado da IA
      },
    ],
  };

  it('deve buscar e mapear os dados do exame corretamente', async () => {
    // Preparando o mock da API e da resolução de URL
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockApiResponse });
    vi.mocked(resolveImageUrl).mockResolvedValue('https://url-resolvida.com/imagem.jpg');

    const result = await getResultadoExame('EX-123');

    // 1. Verifica se a API foi chamada com o endpoint e encode corretos
    expect(api.get).toHaveBeenCalledWith('/api/exams/EX-123');

    // 2. Verifica o mapeamento do objeto principal do exame
    expect(result.exam.id).toBe('EX-123');
    expect(result.exam.nomeCompleto).toBe('Maria Souza');
    expect(result.exam.comorbidades?.diabetes).toBe(true);
    expect(result.exam.medico.nomeCompleto).toBe('Dr. Carlos');

    // 3. Verifica o mapeamento de Imagens e a resolução da URL
    expect(result.imagens).toHaveLength(2);
    expect(result.imagens[0]).toEqual({
      id: 'IMG-1',
      lateralidadeOlho: 'OD',
      qualidadeImg: 'BOA',
      caminhoImg: '',
      url: 'https://url-resolvida.com/imagem.jpg',
    });

    // 4. Verifica o mapeamento dos Resultados IA (deve ignorar a imagem 2 que tem IA null)
    expect(result.resultadosIa).toHaveLength(1);
    expect(result.resultadosIa[0]).toEqual({
      id: 'IA-1',
      idImagem: 'IMG-1',
      predictedClass: 0,
      predictedLabel: 'normal',
      confidence: 0.99,
      probabilities: { normal: 0.99, alterado: 0.01 },
      lateralidadeOlho: 'OD',
      url: 'https://url-resolvida.com/imagem.jpg',
    });
  });

  it('deve lidar com exames sem comorbidades (undefined)', async () => {
    const mockSemComorbidade = {
      ...mockApiResponse,
      comorbidades: undefined,
      imagens: [],
    };

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSemComorbidade });

    const result = await getResultadoExame('EX-999');

    expect(result.exam.comorbidades).toBeUndefined();
  });

  it('deve fazer fallback de url para string vazia quando resolveImageUrl retornar null', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockApiResponse });
    
    // Simulando falha na resolução da URL (ex: token expirado no S3)
    vi.mocked(resolveImageUrl).mockResolvedValue(undefined);

    const result = await getResultadoExame('EX-123');

    // A url deve receber o fallback de string vazia '' em vez de undefined ou null
    expect(result.imagens[0].url).toBe('');
    expect(result.resultadosIa[0].url).toBe('');
  });

  it('deve propagar o erro caso a API falhe', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Erro no servidor'));

    await expect(getResultadoExame('EX-123')).rejects.toThrow('Erro no servidor');
  });
});