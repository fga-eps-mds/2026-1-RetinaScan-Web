import { test, expect, Page } from '@playwright/test';
import { adminCredentials } from '../support/credentials';
import { generateCRM, uniqueCPF, uniqueEmail } from '../support/usuario';

test.describe('cadastro de usuários', () => {
  test('cadastro bem-sucedido fecha o modal e mostra feedback de sucesso', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();

    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: uniqueEmail(),
      senha: 'SenhaForte123',
      confirmarSenha: 'SenhaForte123',
    });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText(/usuário cadastrado com sucesso/i)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toHaveCount(0);
  });

  test('senha divergente é bloqueada antes do envio', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();

    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: uniqueEmail(),
      senha: 'SenhaForte123',
      confirmarSenha: 'outraSenha123',
    });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(
      page.getByText('As senhas não coincidem.').first()
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();
  });

  test('validação do formulário bloqueia um e-mail inválido', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();

    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: 'nao-e-email',
      senha: 'SenhaForte123',
      confirmarSenha: 'SenhaForte123',
    });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();
  });

  test('e-mail já cadastrado é rejeitado pelo backend', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();

    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: adminCredentials.email,
      senha: 'SenhaForte123',
      confirmarSenha: 'SenhaForte123',
    });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();

    await expect(
      page.getByText('Email já cadastrado').first()
    ).toBeVisible();
  });
});

async function loginAsAdmin(page: Page) {
  await page.goto('/login');

  await page.getByPlaceholder('seu@email.com').fill(adminCredentials.email);
  await page.getByPlaceholder('Digite sua senha').fill(adminCredentials.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
  await page.goto('/admin/controle-usuarios');
}

async function fillUserForm(page: Page, data: {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}) {
  await page.getByPlaceholder('Digite o nome do usuário').fill(data.nome);
  await page.getByPlaceholder('seu@email.com').fill(data.email);
  await page.locator('input[type="date"]').fill('1990-01-15');
  await page.getByPlaceholder('000.000.000-00').fill(uniqueCPF);
  await page.getByPlaceholder('000000/UF').fill(generateCRM());
  await page.getByPlaceholder('Digite sua senha').fill(data.senha);
  await page.getByPlaceholder('Confirme sua senha').fill(data.confirmarSenha);
}

