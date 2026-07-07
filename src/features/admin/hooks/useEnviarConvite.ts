/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';
import {
  enviarConvite,
  type EnviarConvitePayload,
  type EnviarConviteResponse,
} from '../api/enviarConvite';
import { toast } from 'sonner';

// Hook personalizado para enviar convites para novos usuários do sistema
export const useEnviarConvite = (onSuccessCallback?: () => void) => {
  return useMutation<EnviarConviteResponse, any, EnviarConvitePayload>({
    mutationFn: (data) => enviarConvite(data),

    onSuccess: (data) => {
      const enviados = data.enviados ?? 0;
      const ignorados = data.ignorados ?? 0;
      const detalhes = data.detalhes ?? [];

      if (ignorados > 0) {
        const detalhesIgnorados = detalhes.filter(
          (item) => item.status === 'ignorado'
        );

        toast.warning(
          `${enviados} convite(s) enviado(s), ${ignorados} ignorado(s).`,
          {
            description: detalhesIgnorados
              .map((item) => `${item.email}: ${item.motivo ?? 'Ignorado'}`)
              .join(' | '),
          }
        );

        return;
      }

      // Se houver convites enviados com sucesso, exibe uma mensagem de sucesso
      if (enviados > 0) {
        toast.success(
          enviados === 1
            ? '1 convite enviado com sucesso!'
            : `${enviados} convites enviados com sucesso!`
        );

        onSuccessCallback?.();
        return;
      }

      toast.message('Nenhum convite foi enviado.');
    },

    // Se ocorrer um erro ao enviar convites, exibe uma mensagem de erro
    onError: (error: any) => {
      toast.error('Erro ao enviar convite.', {
        description:
          error?.response?.data?.message ||
          'Verifique os dados e tente novamente.',
      });
    },
  });
};
