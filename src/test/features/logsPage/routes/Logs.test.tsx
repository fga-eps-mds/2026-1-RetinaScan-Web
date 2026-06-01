import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LogsPage from '@/features/logsPage/routes/Logs';

vi.mock('@/features/logsPage/components/LogsList', () => ({
  LogsList: () => <div>LOGS-LIST-STUB</div>,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('LogsPage', () => {
  it('deve renderizar o título e a lista de logs', () => {
    render(<LogsPage />);

    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText(/registro de todas as movimentações do sistema/i)).toBeInTheDocument();
    expect(screen.getByText('LOGS-LIST-STUB')).toBeInTheDocument();
  });
});
