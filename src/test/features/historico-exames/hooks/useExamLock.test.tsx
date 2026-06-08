
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react'; 
import { renderHook, waitFor } from '@testing-library/react';
import { useExamLock } from '@/features/historico-exames/hooks/useExamLock';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

if (!globalThis.crypto) {
  // @ts-expect-error - Garante fallback para ambientes muito antigos
  globalThis.crypto = {};
}

vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(() => '12345678-1234-1234-1234-1234567890ab');

describe('useExamLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({} as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve adquirir o lock com sucesso e definir o status como "editor"', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { acquired: true, editor: { userId: 'u1', nome: 'Dr. House' } },
    });

    const { result } = renderHook(() => useExamLock({ examId: 'exam-1' }));

    expect(result.current.lockState.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.lockState.status).toBe('editor');
    });
    expect(result.current.sessionId).toBe('12345678-1234-1234-1234-1234567890ab');
  });

  it('deve definir o status como "blocked" se outro usuário já estiver editando', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { acquired: false, editor: { userId: 'u2', nome: 'Dra. Grey' } },
    });

    const { result } = renderHook(() => useExamLock({ examId: 'exam-1' }));

    await waitFor(() => {
      expect(result.current.lockState).toEqual({
        status: 'blocked',
        editorNome: 'Dra. Grey',
      });
    });
  });

  it('deve disparar batimento cardíaco (heartbeat) a cada 30 segundos se for o editor', async () => {

    vi.useFakeTimers();

    vi.mocked(api.post).mockResolvedValueOnce({
      data: { acquired: true, editor: { userId: '1', nome: 'Dr.' } },
    });

    const { result } = renderHook(() => useExamLock({ examId: 'exam-1' }));
    
    // 1. Envolve o avanço inicial em um bloco act para o React processar a Promise do 'acquire'
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Agora o React atualizou o estado com sucesso dentro do ciclo correto
    expect(result.current.lockState.status).toBe('editor');

    // 2. Avança os 30 segundos para acionar o setInterval do heartbeat
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    expect(api.put).toHaveBeenCalledWith('/api/report/exam-1/lock/heartbeat', {
      sessionId: '12345678-1234-1234-1234-1234567890ab',
    });
  });

  it('deve liberar o lock no encerramento (cleanup/unmount) se for editor', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { acquired: true, editor: { userId: '1', nome: 'Dr.' } },
    });

    const { result, unmount } = renderHook(() => useExamLock({ examId: 'exam-1' }));
    
    await waitFor(() => {
      expect(result.current.lockState.status).toBe('editor');
    });

    // Aguarda um ciclo mínimo de macrotask para garantir que a flag isEditor = true persistiu no escopo do useEffect
    await new Promise((resolve) => setTimeout(resolve, 0));

    unmount();

    expect(api.delete).toHaveBeenCalledWith('/api/report/exam-1/lock', {
      data: { sessionId: '12345678-1234-1234-1234-1234567890ab' },
    });
  });
});