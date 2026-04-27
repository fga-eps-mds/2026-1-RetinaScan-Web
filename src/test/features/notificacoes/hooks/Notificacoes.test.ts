import { useNotifications } from '@/features/notificacoes/hooks/Notificacoes';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useNotifications', () => {
  it('deve iniciar com notifications vazio', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
  });

  it('deve atualizar notifications com setNotifications', () => {
    const { result } = renderHook(() => useNotifications());

    const mockNotifications = [
      { id: 1, title: 'Nova notificação' },
      { id: 2, title: 'Outra notificação' },
    ];

    act(() => {
      result.current.setNotifications(mockNotifications);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
  });

  it('deve limpar notifications', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.setNotifications([{ id: 1, title: 'Teste' }]);
    });

    expect(result.current.notifications).toEqual([{ id: 1, title: 'Teste' }]);

    act(() => {
      result.current.setNotifications([]);
    });

    expect(result.current.notifications).toEqual([]);
  });
});
