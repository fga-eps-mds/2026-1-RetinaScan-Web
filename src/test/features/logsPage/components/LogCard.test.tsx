import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LogCard } from '@/features/logsPage/components/LogCard';

vi.mock('@/features/logsPage/hooks/useLogStickerColor', () => ({
  useLogStickerColor: () => (action: string, category: string) => {
    const token = `${action} ${category}`.toUpperCase();

    if (token.includes('DELETE') || token.includes('REJECT')) {
      return '#ef4444';
    }

    if (token.includes('APPROVE') || token.includes('CREATE') || token.includes('UPDATE')) {
      return '#10b981';
    }

    return '#0ea5e9';
  },
}));

describe('LogCard', () => {
  const baseLog = {
    id: '1',
    action: 'APPROVE',
    category: 'USER_MANAGEMENT',
    description: 'Solicitação aprovada',
    actorUserId: 'user-1',
    actorName: 'Administrador',
    actorEmail: 'admin@retinascan.local',
    targetEntityType: 'SOLICITATION',
    targetEntityId: 'target-1',
    targetDisplay: 'target-1',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    requestId: 'req-1',
    changes: { approved: true },
    metadata: { method: 'PATCH' },
    createdAt: '2026-05-31T20:04:56.662Z',
  } as const;

  it('deve renderizar os dados principais do log e responder ao clique', () => {
    const onClick = vi.fn();

    render(<LogCard log={baseLog as any} onClick={onClick} />);

    expect(screen.getByRole('button', { name: /solicitação aprovada/i })).toBeInTheDocument();
    expect(screen.getByText('Solicitação aprovada')).toBeInTheDocument();
    expect(screen.getByText(/Administrador/)).toBeInTheDocument();
    expect(screen.getByText(/admin@retinascan.local/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('deve usar a cor verde para ações de aprovação', () => {
    render(<LogCard log={baseLog as any} />);

    expect(screen.getByRole('button')).toHaveStyle({ borderLeftColor: '#10b981' });
  });

  it('deve usar a cor vermelha para rejeição', () => {
    render(
      <LogCard
        log={{
          ...baseLog,
          action: 'REJECT',
          description: 'Solicitação rejeitada',
        } as any}
      />,
    );

    expect(screen.getByRole('button')).toHaveStyle({ borderLeftColor: '#ef4444' });
  });

  it('deve usar a cor azul como padrão', () => {
    render(
      <LogCard
        log={{
          ...baseLog,
          action: 'VIEW',
          category: 'STANDARD',
        } as any}
      />,
    );

    expect(screen.getByRole('button')).toHaveStyle({ borderLeftColor: '#0ea5e9' });
  });
});
