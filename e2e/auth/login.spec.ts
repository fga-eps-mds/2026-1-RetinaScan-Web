import { test, expect } from '@playwright/test';
import { adminCredentials } from '../support/credentials';

test.describe('login', () => {
  test('successful login lands on the authenticated shell', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('seu@email.com').fill(adminCredentials.email);
    await page
      .getByPlaceholder('Digite sua senha')
      .fill(adminCredentials.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
  });

  test('invalid password is rejected by the backend', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('seu@email.com').fill(adminCredentials.email);
    await page.getByPlaceholder('Digite sua senha').fill('senha-errada-123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText(/invalid email or password|falha ao entrar/i).first()
    ).toBeVisible();
  });

  test('form validation blocks an invalid email', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('seu@email.com').fill('nao-e-email');
    await page.getByPlaceholder('Digite sua senha').fill('qualquercoisa');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: /entrar na plataforma/i })
    ).toBeVisible();
  });

  test('logout ends the session and returns to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill(adminCredentials.email);
    await page
      .getByPlaceholder('Digite sua senha')
      .fill(adminCredentials.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();

    await page.getByRole('button', { name: /sair/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: /entrar na plataforma/i })
    ).toBeVisible();
  });
});
