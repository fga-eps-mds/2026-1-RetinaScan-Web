import { describe, it, expect } from 'vitest';
import { mapDashboardMetrics } from '@/utils/mappers/mapDashboardMetrics';
import type { BackendMetricsResponseDTO } from '@/features/home/types/dashboard-result'; // Ajuste o caminho de importação se necessário

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
    const mockData: BackendMetricsResponseDTO = {
      volume: {
        total: 100,
        porStatus: {
          CRIADO: 10,
          EM_PROCESSAMENTO: 5,
          ERRO_PROCESSAMENTO: 2,
          CONCLUIDO: 83,
        },
        serieTemporal: [], // Necessário para a nova tipagem
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
    const mockDataPartial: BackendMetricsResponseDTO = {
      volume: {
        total: 10,
        porStatus: {
          // Ausência de CRIADO, EM_PROCESSAMENTO e ERRO_PROCESSAMENTO
          CONCLUIDO: 10,
        } as any, // Força a simulação de chaves faltando para o teste de resiliência
        serieTemporal: [],
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

  it('deve ser case-insensitive ao buscar os diagnósticos (tratar maiúsculas e minúsculas)', () => {
    // Arrange: Simula o backend retornando os labels com formatações inconsistentes
    const mockComLetrasMaiusculas: BackendMetricsResponseDTO = {
      volume: { 
        total: 10, 
        porStatus: { CRIADO: 10, CONCLUIDO: 0, EM_PROCESSAMENTO: 0, ERRO_PROCESSAMENTO: 0 }, 
        serieTemporal: [] 
      },
      resultadosIa: {
        totalResultados: 10,
        confiancaMedia: 0.9,
        porDiagnostico: [
          { label: 'NORMAL', total: 7 },    // Backend mandou em CAIXA ALTA
          { label: 'AbNormal', total: 3 },  // Backend mandou Misturado
        ],
      },
    };

    // Act
    const result = mapDashboardMetrics(mockComLetrasMaiusculas);
    
    // Assert
    expect(result.resultadosNormais.total).toBe(7);
    expect(result.indicacaoEspecialista.total).toBe(3);
  });

  it('não deve quebrar a aplicação caso a API envie um payload parcial (sem porStatus ou porDiagnostico)', () => {
    // Arrange: Simulando um payload incompleto ou mal formatado da API
    const mockIncompleto = {
      volume: { total: 5 }, // Cadê o porStatus e a serieTemporal?
      resultadosIa: { totalResultados: 5, confiancaMedia: 0.8 }, // Cadê o porDiagnostico?
    } as unknown as BackendMetricsResponseDTO;

    // Act
    const result = mapDashboardMetrics(mockIncompleto);

    // Assert: A aplicação deve sobreviver e jogar os valores ausentes para zero graciosamente
    expect(result.pendentes.total).toBe(0);
    expect(result.errosProcessamento.total).toBe(0);
    expect(result.resultadosNormais.total).toBe(0);
    expect(result.indicacaoEspecialista.total).toBe(0);
  });
});