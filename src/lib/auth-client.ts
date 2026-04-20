import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        cpf: {
          type: 'string',
          required: true,
        },
        crm: {
          type: 'string',
          required: true,
        },
        dtNascimento: {
          type: 'date',
          required: false,
        },
        tipoPerfil: {
          type: 'string',
          required: false,
        },
        status: {
          type: 'string',
          required: false,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
