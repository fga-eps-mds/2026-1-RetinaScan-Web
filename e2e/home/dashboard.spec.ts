import { test, expect } from '@playwright/test';
import { adminCredentials } from '../support/credentials';
import { criarUsuarioLimpoE2E } from '../support/usuario';

let credenciaisMedico: { email: string; senha: string };
let credenciaisEspecialista: { email: string; senha: string };

test.describe('Controle de Acesso - Dashboard', () => {
  
  test.beforeAll(async ({ browser }) => {
    // Cria os dois perfis distintos antes da suite rodar
    credenciaisMedico = await criarUsuarioLimpoE2E(browser, 'MEDICO');
    credenciaisEspecialista = await criarUsuarioLimpoE2E(browser, 'ESPECIALISTA');
  });

  test('deve renderizar o dashboard global com permissões de Administrador', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill(adminCredentials.email);
    await page.getByPlaceholder('Digite sua senha').fill(adminCredentials.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
    
    await page.goto('/');

    // Validação Admin
    await expect(page.getByText('Dashboard do Administrador')).toBeVisible();
    await expect(page.getByText('Visão geral da triagem de retinografia e performance do sistema.')).toBeVisible();

    // Segurança
    await expect(page.getByText('Meu Dashboard')).not.toBeVisible();
    await expect(page.getByText('Dashboard do Especialista')).not.toBeVisible();
  });

  test('deve renderizar o dashboard pessoal com permissões restritas de Médico', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill(credenciaisMedico.email);
    await page.getByPlaceholder('Digite sua senha').fill(credenciaisMedico.senha);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
    
    await page.goto('/');

    // Validação Médico
    await expect(page.getByText('Meu Dashboard')).toBeVisible();
    await expect(page.getByText('Acompanhe o volume e o status de processamento dos seus exames solicitados.')).toBeVisible();

    // Segurança
    await expect(page.getByText('Dashboard do Administrador')).not.toBeVisible();
    await expect(page.getByText('Dashboard do Especialista')).not.toBeVisible();
  });

  test('deve renderizar o dashboard de laudos com permissões restritas de Especialista', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill(credenciaisEspecialista.email);
    await page.getByPlaceholder('Digite sua senha').fill(credenciaisEspecialista.senha);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
    
    await page.goto('/');

    // Validação Especialista
    await expect(page.getByText('Dashboard do Especialista')).toBeVisible();
    await expect(page.getByText('Visão geral de exames que necessitam do seu laudo.')).toBeVisible();

    // Segurança
    await expect(page.getByText('Dashboard do Administrador')).not.toBeVisible();
    await expect(page.getByText('Meu Dashboard')).not.toBeVisible();
  });
});