import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLogStickerColor } from '@/features/logsPage/hooks/useLogStickerColor';

describe('useLogStickerColor', () => {
  it('deve retornar verde para ações de aprovação/criação', () => {
    const { result } = renderHook(() => useLogStickerColor());

    expect(result.current('APPROVE', 'USER_MANAGEMENT')).toBe('#00A63E');
    expect(result.current('CREATE', 'STANDARD')).toBe('#00A63E');
  });

  it('deve retornar vermelho para rejeição/remoção', () => {
    const { result } = renderHook(() => useLogStickerColor());

    expect(result.current('REJECT', 'USER_MANAGEMENT')).toBe('#E7000B');
    expect(result.current('DELETE', 'AUDIT')).toBe('#E7000B');
  });

  it('deve retornar azul como cor padrão', () => {
    const { result } = renderHook(() => useLogStickerColor());

    expect(result.current('VIEW', 'STANDARD')).toBe('#1A63AB');
  });
});
