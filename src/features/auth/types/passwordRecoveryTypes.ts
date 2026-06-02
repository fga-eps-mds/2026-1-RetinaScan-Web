export type RecoverInput =
  | { type: 'email'; value: string }
  | { type: 'crm'; value: string };

export type PasswordRecoveryResponse = {
  message: string;
};

export type ApiErrorResponse = {
  message?: string;
};
