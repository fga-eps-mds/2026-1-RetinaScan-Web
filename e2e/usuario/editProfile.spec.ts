import { test, expect } from '@playwright/test';
import {
  criarUsuarioLimpoE2E,
  generateCRM,
  uniqueCPF,
} from '../support/usuario';

// Variável para guardar as credenciais exclusivas do usuário gerado para esta suite de testes
let credenciaisUsuario: { email: string; senha: string };

test.describe('Edição de Perfil do Usuário', () => {
  // Executa uma única vez antes de todos os testes: solicita a criação de um usuário totalmente limpo
  test.beforeAll(async ({ browser }) => {
    credenciaisUsuario = await criarUsuarioLimpoE2E(browser);
  });

  // Executa antes de cada teste: faz o login com o novo usuário e abre a tela de perfil
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill(credenciaisUsuario.email);
    await page
      .getByPlaceholder('Digite sua senha')
      .fill(credenciaisUsuario.senha);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();

    // Navega para a rota de edição de perfil via parâmetro na URL
    await page.goto('/?editProfile=true');
  });

  test('deve atualizar os dados básicos do perfil com sucesso', async ({
    page,
  }) => {
    // Localiza os inputs partindo da label correspondente (evita quebra por strict mode)
    const inputNome = page
      .locator('label')
      .filter({ hasText: /^Nome Completo$/ })
      .locator('..')
      .locator('input');
    await inputNome.fill('Usuário Editado E2E');

    const inputEmail = page
      .locator('label')
      .filter({ hasText: /^Email$/ })
      .locator('..')
      .locator('input');
    // Usa o timestamp atual para garantir que o e-mail editado também seja único no banco
    await inputEmail.fill(`editado_${Date.now()}@retinascan.local`);

    const btnAtualizar = page.getByRole('button', { name: 'Atualizar' });
    await expect(btnAtualizar).toBeEnabled();
    await btnAtualizar.click();

    // Valida o toast de sucesso do sistema
    await expect(page.getByText('Perfil atualizado!')).toBeVisible(); // Ajuste para a string exata do seu sistema se necessário
  });

  test('deve alternar a visibilidade da senha corretamente', async ({
    page,
  }) => {
    const senhaInput = page.getByPlaceholder('••••••••••').first();
    const btnOlho = senhaInput.locator('..').locator('button');

    await expect(senhaInput).toHaveAttribute('type', 'password');
    await btnOlho.click();
    await expect(senhaInput).toHaveAttribute('type', 'text');
  });

  test('deve abrir o modal e enviar solicitação de alteração de CRM/CPF validando sucesso', async ({
    page,
  }) => {
    await page
      .getByText('Para a alteração de CRM ou CPF, solicite ao administrador')
      .click();
    await expect(
      page.getByRole('heading', { name: 'Solicitar alteração' })
    ).toBeVisible();

    await page.getByPlaceholder('Ex: 123456/UF').fill(generateCRM('SP'));
    await page.getByPlaceholder('Ex: 123.456.789-00').fill(uniqueCPF);

    await page.getByRole('button', { name: 'Enviar Solicitação' }).click();

    // Como o texto do toast é dinâmico (vem do backend),
    // a prova de sucesso é que o sistema fecha o modal automaticamente.
    await expect(
      page.getByRole('heading', { name: 'Solicitar alteração' })
    ).not.toBeVisible();
  });
});
