import process from 'node:process';

export const adminCredentials = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@retinascan.local',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'SenhaMuitoForte123',
};
