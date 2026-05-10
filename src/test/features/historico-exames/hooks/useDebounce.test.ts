import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '@/features/historico-exames/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    // Inicia o uso de timers falsos para controlar o tempo no teste
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restaura os timers originais após cada teste
    vi.useRealTimers();
  });

  it('deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('valor inicial', 500));
    
    expect(result.current).toBe('valor inicial');
  });

  it('deve atualizar o valor somente após o delay especificado', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'inicial', delay: 500 } }
    );

    // Muda a prop 'value' para 'atualizado'
    rerender({ value: 'atualizado', delay: 500 });

    // Verifica que, imediatamente após a mudança, o valor debounced AINDA é o antigo
    expect(result.current).toBe('inicial');

    // Avança o relógio em 499ms (ainda não deve ter atualizado)
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('inicial');

    // Avança o último 1ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    
    // Agora o valor deve ter sido atualizado
    expect(result.current).toBe('atualizado');
  });

  it('deve resetar o timer se o valor mudar antes do delay terminar', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'A', delay: 500 } }
    );

    // Muda para 'B'
    rerender({ value: 'B', delay: 500 });
    
    // Avança 300ms (faltavam 200ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Muda para 'C' antes de processar o 'B'
    rerender({ value: 'C', delay: 500 });

    // Avança mais 300ms (total 600ms desde o início, mas apenas 300ms desde o 'C')
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // O valor não deve ser 'B', e ainda não deve ser 'C'
    expect(result.current).toBe('A');

    // Avança os 200ms restantes para o 'C'
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('C');
  });
});