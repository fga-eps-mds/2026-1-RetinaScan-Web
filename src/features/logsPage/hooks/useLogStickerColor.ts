import { useCallback } from 'react';

export function useLogStickerColor() {
  return useCallback((action: string, category: string) => {
    const token = `${action} ${category}`.toUpperCase();

    if (
      token.includes('DELETE') ||
      token.includes('REMOVE') ||
      token.includes('REJECT') ||
      token.includes('DENY') ||
      token.includes('DECLINE')
    ) {
      return '#E7000B';
    }

    if (
      token.includes('APPROVE') ||
      token.includes('APPROVED') ||
      token.includes('CREATE') ||
      token.includes('SUCCESS')
    ) {
      return '#00A63E';
    }

    return '#1A63AB';
  }, []);
}