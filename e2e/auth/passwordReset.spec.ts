import { test, expect } from '@playwright/test';
import { adminCredentials } from '../support/credentials';

test.describe('recuperação de senha', () => {
  test('solicitação de reset com e-mail válido exibe feedback de sucesso', async ({ page }) => {
    // Intercepta a chamada da API para garantir o sucesso mesmo sem envio real de e-mail no ambiente E2E
    await page.route('**/api/auth/request-password-reset', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Instruções enviadas com sucesso.' }),
      });
    });

    await page.goto('/login');

    // Abre o modal de recuperação
    await page.getByRole('button', { name: /esqueceu a senha\?/i }).click();
    await expect(page.getByRole('heading', { name: /esqueci minha senha/i })).toBeVisible();

    // Preenche e envia
    await page.getByPlaceholder(/digite seu e-mail ou crm/i).fill(adminCredentials.email);
    await page.getByRole('button', { name: /enviar instruções/i }).click();

    // Valida o feedback de sucesso
    await expect(page.getByRole('heading', { name: /solicitação enviada/i })).toBeVisible();
    await expect(page.getByText(/verifique sua caixa de entrada/i)).toBeVisible();
  });

  test('validação bloqueia envio de e-mail ou crm em formato inválido', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /esqueceu a senha\?/i }).click();

    await page.getByPlaceholder(/digite seu e-mail ou crm/i).fill('formato-invalido-123');
    
    // Tenta submeter
    await page.getByRole('button', { name: /enviar instruções/i }).click();

    // Verifica a mensagem de erro da validação do modal
    await expect(page.getByText(/informe um e-mail ou crm válido/i)).toBeVisible();
  });

  test('atualização com token simulando o link recebido', async ({ page }) => {
    // Intercepta a requisição de reset de senha para retornar sucesso simulando um backend
    await page.route('**/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Senha redefinida com sucesso' }),
      });
    });

    // Acessa a rota com um token falso simulando o clique no link recebido no e-mail
    await page.goto('/reset-password?token=fake-token-simulado-123');

    await expect(page.getByRole('heading', { name: /redefinir senha/i })).toBeVisible();

    // Preenche as novas senhas
    await page.getByPlaceholder('Digite sua nova senha').fill('NovaSenha123!');
    await page.getByPlaceholder('Confirme sua nova senha').fill('NovaSenha123!');

    await page.getByRole('button', { name: /redefinir senha/i }).click();

    // Valida a tela de feedback final de sucesso
    await expect(page.getByRole('heading', { name: /senha redefinida/i, exact: true })).toBeVisible();
    await expect(page.getByText(/sua senha foi atualizada com sucesso/i)).toBeVisible();
    
    // Verifica se o botão de voltar para o login é renderizado
    await expect(page.getByRole('link', { name: /ir para login/i })).toBeVisible();
  });

  test('bloqueia redefinição se as senhas não coincidirem', async ({ page }) => {
    await page.goto('/reset-password?token=fake-token-simulado-123');

    await page.getByPlaceholder('Digite sua nova senha').fill('NovaSenha123!');
    await page.getByPlaceholder('Confirme sua nova senha').fill('SenhaDiferente123!');

    // O botão deve ficar desabilitado
    await expect(page.getByRole('button', { name: /redefinir senha/i })).toBeDisabled();

    // Verifica validação do frontend exibida dinamicamente
    await expect(page.getByText('As senhas não coincidem')).toBeVisible();
  });

  test('bloqueia o acesso direto à redefinição sem token', async ({ page }) => {
    await page.goto('/reset-password'); // Acessa sem o token

    // O token ausente deve barrar no clique
    await page.getByPlaceholder('Digite sua nova senha').fill('NovaSenha123!');
    await page.getByPlaceholder('Confirme sua nova senha').fill('NovaSenha123!');

    // O botão deve ficar desabilitado
    await expect(page.getByRole('button', { name: /redefinir senha/i })).toBeDisabled();

    // Verifica validação da ausência do query param exibida na tela
    await expect(page.getByText('Link inválido ou expirado.')).toBeVisible();
  });
});
