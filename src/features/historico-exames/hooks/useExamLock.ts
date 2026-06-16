import { api } from '@/shared/api';
import { useEffect, useRef, useState } from 'react';

type LockState =
  | { status: 'loading' }
  | { status: 'editor' }
  | { status: 'blocked'; editorNome: string }
  | { status: 'error' };

type UseExamLockParams = {
  examId: string | null | undefined;
  enabled?: boolean;
};

type UseExamLockResult = {
  lockState: LockState;
  sessionId: string | null;
};

export function useExamLock({
  examId,
  enabled = true,
}: UseExamLockParams): UseExamLockResult {
  const [lockState, setLockState] = useState<LockState>({ status: 'loading' });

  const sessionIdRef = useRef<string | null>(null);
  // eslint-disable-next-line react-hooks/refs
  if (!sessionIdRef.current) {
    sessionIdRef.current = crypto.randomUUID();
  }

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!examId || !enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLockState({ status: 'loading' });
      return;
    }

    const sessionId = sessionIdRef.current!;
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    let isEditor = false;

    // Usa fetch com keepalive para garantir envio mesmo ao fechar/navegar.
    // keepalive funciona melhor que sendBeacon para endpoints autenticados.
    const releaseLock = () => {
      if (!isEditor) return;
      const url = `${import.meta.env.VITE_API_URL}/api/report/${examId}/lock`;
      
      // CORREÇÃO SONAR: Removido operador 'void' em favor da chamada direta
      fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        credentials: 'include',
        keepalive: true,
      });
    };

    const acquire = async () => {
      try {
        const response = await api.post<{
          acquired: boolean;
          editor: { userId: string; nome: string };
        }>(`/api/report/${examId}/lock`, { sessionId });

        if (!mountedRef.current) return;

        if (response.data.acquired) {
          isEditor = true;
          setLockState({ status: 'editor' });

          heartbeatInterval = setInterval(async () => {
            try {
              await api.put(`/api/report/${examId}/lock/heartbeat`, {
                sessionId,
              });
            } catch (err: unknown) {
              if (
                (err as { response?: { status: number } })?.response?.status ===
                404
              ) {
                // Lock expirou — tenta re-acquire
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                heartbeatInterval = null;
                isEditor = false;
                if (mountedRef.current) await acquire();
              }
            }
          }, 30_000);
        } else {
          isEditor = false;
          setLockState({
            status: 'blocked',
            editorNome: response.data.editor.nome,
          });
        }
      } catch {
        if (mountedRef.current) setLockState({ status: 'error' });
      }
    };

    acquire();

    // Garante release ao fechar aba/janela
    window.addEventListener('beforeunload', releaseLock);

    // Garante release ao navegar para outra página (SPA)
    // visibilitychange para hidden não é suficiente pois o componente
    // pode desmontar antes do evento. O cleanup abaixo cobre a navegação SPA,
    // e o beforeunload cobre fechar a aba.

    return () => {
      window.removeEventListener('beforeunload', releaseLock);
      if (heartbeatInterval) clearInterval(heartbeatInterval);

      // Navegação SPA: componente desmonta, faz release normal via axios
      if (isEditor) {
        
        api.delete(`/api/report/${examId}/lock`, { data: { sessionId } });
      }

      isEditor = false;
    };
  }, [examId, enabled]);

  // eslint-disable-next-line react-hooks/refs
  return { lockState, sessionId: sessionIdRef.current };
}