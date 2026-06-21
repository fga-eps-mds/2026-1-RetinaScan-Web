import { describe, it, expect } from 'vitest';
import { mapDashboardMetrics, type ApiDashboardMetrics } from '@/utils/mappers/mapDashboardMetrics';

describe('mapDashboardMetrics', () => {
  it('deve retornar valores zerados (estado inicial) se a API retornar null ou undefined', () => {
    // Act
    const resultNull = mapDashboardMetrics(null);
    const resultUndefined = mapDashboardMetrics(undefined);

    // Assert
    const expectedFallback = {
      analisesTotais: { total: 0, periodoDias: 30 },
      indicacaoEspecialista: { total: 0, porcentagem: 0 },
      resultadosNormais: { total: 0, porcentagem: 0 },
      pendentes: { total: 0 },
      errosProcessamento: { total: 0 },
      confiancaIa: { media: 0 },
    };

    expect(resultNull).toEqual(expectedFallback);
    expect(resultUndefined).toEqual(expectedFallback);
  });

  it('deve calcular corretamente os totais e as porcentagens com dados completos', () => {
    // Arrange: Simula uma resposta perfeita e completa da API
    const mockData: ApiDashboardMetrics = {
      volume: {
        total: 100,
        porStatus: {
          CRIADO: 10,
          EM_PROCESSAMENTO: 5,
          ERRO_PROCESSAMENTO: 2,
          CONCLUIDO: 83,
        },
      },
      resultadosIa: {
        totalResultados: 80, // Total processado pela IA
        confiancaMedia: 0.956, // 95.6%
        porDiagnostico: [
          { label: 'normal', total: 60 },
          { label: 'abnormal', total: 20 },
        ],
      },
    };

    // Act
    const result = mapDashboardMetrics(mockData);

    // Assert
    expect(result.analisesTotais.total).toBe(100);
    // 10 CRIADOS + 5 EM_PROCESSAMENTO = 15 pendentes
    expect(result.pendentes.total).toBe(15);
    expect(result.errosProcessamento.total).toBe(2);
    
    // Confiança deve ser arredondada (0.956 * 100) = 96
    expect(result.confiancaIa.media).toBe(96);

    // Verificando diagnósticos (20 anormais / 80 total = 25%)
    expect(result.indicacaoEspecialista.total).toBe(20);
    expect(result.indicacaoEspecialista.porcentagem).toBe(25);

    // Verificando diagnósticos (60 normais / 80 total = 75%)
    expect(result.resultadosNormais.total).toBe(60);
    expect(result.resultadosNormais.porcentagem).toBe(75);
  });

  it('deve lidar corretamente com chaves de status e diagnósticos vazios/ausentes', () => {
    // Arrange: Simula uma resposta válida, mas vazia em algumas categorias
    const mockDataPartial: ApiDashboardMetrics = {
      volume: {
        total: 10,
        porStatus: {
          // Ausência de CRIADO, EM_PROCESSAMENTO e ERRO_PROCESSAMENTO
          CONCLUIDO: 10,
        },
      },
      resultadosIa: {
        totalResultados: 0, 
        confiancaMedia: 0,
        porDiagnostico: [], // Nenhum diagnóstico ainda
      },
    };

    // Act
    const result = mapDashboardMetrics(mockDataPartial);

    // Assert: O sistema de "|| 0" deve garantir que o código não quebre
    expect(result.pendentes.total).toBe(0);
    expect(result.errosProcessamento.total).toBe(0);
    expect(result.indicacaoEspecialista.total).toBe(0);
    expect(result.resultadosNormais.total).toBe(0);
    
    // Garante que não retorne NaN na porcentagem caso totalResultados seja 0
    expect(result.indicacaoEspecialista.porcentagem).toBe(0);
  });
});