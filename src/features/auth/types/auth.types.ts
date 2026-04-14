export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  crm: string;
  birthDate: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
