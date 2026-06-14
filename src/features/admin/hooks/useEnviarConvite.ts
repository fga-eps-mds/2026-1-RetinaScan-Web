/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';
import { enviarConvite, type EnviarConvitePayload } from '../api/enviarConvite';
import { toast } from 'sonner';

/**
 * Hook para gerenciar o disparo de convites.
 * @param onSuccessCallback - Callback opcional executado após sucesso (ex: fechar modal/limpar state)
 */
export const useEnviarConvite = (onSuccessCallback?: () => void) => {
  return useMutation({
    mutationFn: (data: EnviarConvitePayload) => enviarConvite(data),
    
    onSuccess: () => {
      toast.success('Convite enviado com sucesso!');
      // Executa callback de limpeza se fornecido
      if (onSuccessCallback) onSuccessCallback();
    },
    
    onError: (error: any) => {
      // Captura mensagem detalhada do backend se disponível, caso contrário exibe padrão
      toast.error('Erro ao enviar convite.', {
        description: error?.response?.data?.message || 'Verifique os dados e tente novamente.',
      });
    },
  });
};