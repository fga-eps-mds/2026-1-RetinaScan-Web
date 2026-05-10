import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFiltroExames } from '@/features/historico-exames'; 
import type { ExameHistory } from '@/features/historico-exames'; 

const mockDados: ExameHistory[] = [
  { idExame: 'EX-1234-5678', nomePaciente: 'Ana Silva', olho: 'OD' as any, scoreIA: '90', status: 'Normal', data: '2026-05-10' },
  { idExame: 'EX-9999-0000', nomePaciente: 'Bruno Costa', olho: 'OE' as any, scoreIA: '30', status: 'Prioridade', data: '2026-05-09' },
  { idExame: 'EX-5555-4444', nomePaciente: 'Carlos Souza', olho: 'OD' as any, scoreIA: '50', status: 'Pendente', data: '2026-05-08' },
];

describe('useFiltroExames', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('deve inicializar com todos os dados e filtros vazios', () => {
    const { result } = renderHook(() => useFiltroExames(mockDados));
    expect(result.current.dadosFiltrados).toHaveLength(3);
  });

  it('deve filtrar por paciente após o delay do debounce', () => {
    const { result } = renderHook(() => useFiltroExames(mockDados));

    act(() => {
      result.current.setBusca('Bruno');
    });

    // Antes de avançar o tempo, ainda deve ter 3 itens
    expect(result.current.dadosFiltrados).toHaveLength(3);

    act(() => {
      vi.runAllTimers(); // Dispara o debounce instantaneamente
    });

    expect(result.current.dadosFiltrados).toHaveLength(1);
    expect(result.current.dadosFiltrados[0].nomePaciente).toBe('Bruno Costa');
  });

  it('deve combinar filtros de prioridade e busca', () => {
    const { result } = renderHook(() => useFiltroExames(mockDados));

    act(() => {
      result.current.setFiltroPrioridade('Prioridade'); // Use o case exato do mock
      result.current.setBusca('EX-9999-0000');
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.dadosFiltrados).toHaveLength(1);

    act(() => {
      result.current.setBusca('EX-1234-5678'); // Ana (Normal)
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.dadosFiltrados).toHaveLength(0);
  });

  it('deve retornar lista vazia se nenhum critério bater', () => {
    const { result } = renderHook(() => useFiltroExames(mockDados));

    act(() => {
      result.current.setBusca('Paciente Fantasma');
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.dadosFiltrados).toHaveLength(0);
  });

  it('deve validar o padrão de ID corretamente', () => {
    const { result } = renderHook(() => useFiltroExames(mockDados));

    act(() => {
      result.current.setBusca('EX-1234-5678');
    });
    
    expect(result.current.isSearchValid).toBe(true);
  });
});