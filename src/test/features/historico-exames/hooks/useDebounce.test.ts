import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebouncedValue } from '@/features/historico-exames/hooks/useDebounce';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() =>
      useDebouncedValue('valor inicial', 500)
    );

    expect(result.current).toBe('valor inicial');
  });

  it('deve atualizar o valor somente após o delay especificado', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'inicial', delay: 500 },
      }
    );

    rerender({ value: 'atualizado', delay: 500 });

    expect(result.current).toBe('inicial');

    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(result.current).toBe('inicial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('atualizado');
  });

  it('deve resetar o timer se o valor mudar antes do delay terminar', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'A', delay: 500 },
      }
    );

    rerender({ value: 'B', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'C', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('A');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('C');
  });

  it('deve limpar o timeout ao desmontar', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const { unmount } = renderHook(() => useDebouncedValue('teste', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
