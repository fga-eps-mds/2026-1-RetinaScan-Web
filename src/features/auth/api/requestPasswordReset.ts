import { api } from '@/shared/api';
import type {
  RecoverInput,
  PasswordRecoveryResponse,
} from '../types/passwordRecoveryTypes';

function normalizeCRM(value: string) {
  return value.toUpperCase().replace(/\s+/g, ' ').trim();
}

export async function requestPasswordRecovery(
  input: RecoverInput
): Promise<PasswordRecoveryResponse> {
  const frontUrl = `${window.location.origin}/reset-password`;

  if (input.type === 'email') {
    const { data } = await api.post<PasswordRecoveryResponse>(
      '/api/auth/request-password-reset',
      {
        email: input.value.trim(),
        redirectTo: frontUrl,
      }
    );

    return data;
  }

  const { data } = await api.post<PasswordRecoveryResponse>(
    '/api/auth/recover-by-crm',
    {
      crm: normalizeCRM(input.value),
      redirectTo: frontUrl,
    }
  );

  return data;
}
