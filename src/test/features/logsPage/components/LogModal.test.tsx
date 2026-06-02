import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LogModal from '@/features/logsPage/components/LogModal';

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

describe('LogModal', () => {
  const log = {
    id: '2c7eace8-6a31-4234-bef7-ad525ae58e4a',
    action: 'APPROVE',
    category: 'USER_MANAGEMENT',
    description: 'Solicitação aprovada',
    actorUserId: 'epH546JHIY6mrg864nkuraP8wCIY9Gpf',
    actorName: 'Administrador',
    actorEmail: 'admin@retinascan.local',
    targetEntityType: 'SOLICITATION',
    targetEntityId: '5f78d9e3-d512-43e3-942c-40773ba65186',
    targetDisplay: '5f78d9e3-d512-43e3-942c-40773ba65186',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    requestId: 'req-v',
    changes: {
      solicitacao: { id: '5f78d9e3-d512-43e3-942c-40773ba65186', status: 'APROVADA' },
      notificacaoEnviada: true,
    },
    metadata: {
      url: '/api/usuarios/solicitacoes-cpf-crm/5f78d9e3-d512-43e3-942c-40773ba65186/aprovar',
      method: 'PATCH',
      source: 'usuarioRoutes.aprovarSolicitacaoCpfCrmRoute',
      statusCode: 200,
      responseTime: 4576.821549999993,
      idSolicitacao: '5f78d9e3-d512-43e3-942c-40773ba65186',
    },
    createdAt: '2026-05-31T20:04:56.662Z',
  } as const;

  it('deve renderizar todas as seções do detalhamento do log', () => {
    render(<LogModal isOpen={true} onClose={vi.fn()} log={log as any} />);

    expect(screen.getByText(/detalhamento do log/i)).toBeInTheDocument();
    expect(screen.getByText('Solicitação aprovada')).toBeInTheDocument();
    expect(screen.getByText(/Administrador/)).toBeInTheDocument();
    expect(screen.getByText(/admin@retinascan.local/)).toBeInTheDocument();
    expect(screen.getByText(/epH546JHIY6mrg864nkuraP8wCIY9Gpf/)).toBeInTheDocument();
    expect(screen.getByText(/127.0.0.1/)).toBeInTheDocument();
    expect(screen.getByText(/req-v/)).toBeInTheDocument();
    expect(screen.getByText(/"status": "APROVADA"/i)).toBeInTheDocument();
    expect(screen.getByText(/"method": "PATCH"/i)).toBeInTheDocument();
  });

  it('não deve renderizar conteúdo quando o log for nulo', () => {
    render(<LogModal isOpen={true} onClose={vi.fn()} log={null} />);

    expect(screen.getByText(/detalhamento do log/i)).toBeInTheDocument();
    expect(screen.queryByText('Solicitação aprovada')).toBeNull();
  });
});
