import { test, expect } from '@playwright/test';
import { criarUsuarioLimpoE2E, uniqueCPF } from '../support/usuario';

let credenciaisMedico: { email: string; senha: string };

test.describe('Criação de Exames (Caminho Feliz)', () => {
  test.beforeAll(async ({ browser }) => {
    credenciaisMedico = await criarUsuarioLimpoE2E(browser);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill(credenciaisMedico.email);
    await page
      .getByPlaceholder('Digite sua senha')
      .fill(credenciaisMedico.senha);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
  });

  test('deve concluir a jornada completa de criação (Upload -> Formulário)', async ({
    page,
  }) => {
    await page.goto('/exames/novo');

    await expect(
      page.getByText('Inicie fazendo o upload das imagens da retina.')
    ).toBeVisible();

    // O Playwright resolve caminhos relativos a partir da raiz do projeto (onde fica o package.json)
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles('src/assets/retinaExemplo1.png');

    const btnContinuar = page.getByRole('button', {
      name: 'Continuar para Dados',
    });
    await expect(btnContinuar).toBeEnabled();
    await btnContinuar.click();

    await expect(
      page.getByText('Revise e complete os dados do paciente')
    ).toBeVisible();

    await page
      .getByPlaceholder('Digite o nome completo do paciente')
      .fill('Paciente E2E Teste Automático');
    await page.locator('input[type="date"]').fill('1985-05-20');

    await page.locator('select#sexo').selectOption('MASCULINO');

    await page.getByPlaceholder('000.000.000-00').fill(uniqueCPF);

    await page
      .locator('label')
      .filter({ hasText: /^Diabetes$/ })
      .locator('button[role="checkbox"]')
      .click();
    await page.getByPlaceholder('Ex: 10').fill('5');

    await page
      .getByPlaceholder('Dê uma descrição sobre o motivo do exame')
      .fill(
        'Exame de rotina simulado via automação E2E. Paciente não apresenta queixas agudas.'
      );

    const btnSalvar = page.getByRole('button', { name: 'Salvar Exame' });
    await expect(btnSalvar).toBeEnabled();
    await btnSalvar.click();

    await expect(page.getByText(/criado com sucesso/i)).toBeVisible();
  });
});
