import { cpf } from 'cpf-cnpj-validator';
import { Browser, expect } from '@playwright/test';
import { adminCredentials } from './credentials';

export const uniqueCPF = cpf.generate();

export function generateCRM(uf = 'DF'): string {
  const number = Math.floor(100000 + Math.random() * 900000);
  return `${number}${uf}`;
}

export function uniqueEmail() {
    return `usuario-${crypto.randomUUID()}@retinascan.local`;
}

// --- Nova Função Auxiliar Adicionada ---
export async function criarUsuarioLimpoE2E(browser: Browser) {
  // Abre uma aba anônima e invisível só para o Admin
  const context = await browser.newContext();
  const adminPage = await context.newPage();

  // Usa a sua função uniqueEmail para gerar o e-mail
  const emailUsuario = uniqueEmail();
  const senhaUsuario = 'SenhaForte123';
  
  // Gera um CPF novo exclusivo para este cadastro
  const novoCpf = cpf.generate(); 

  // 1. Loga como admin
  await adminPage.goto('/login');
  await adminPage.getByPlaceholder('seu@email.com').fill(adminCredentials.email);
  await adminPage.getByPlaceholder('Digite sua senha').fill(adminCredentials.password);
  await adminPage.getByRole('button', { name: 'Entrar' }).click();
  await expect(adminPage.getByRole('button', { name: /sair/i })).toBeVisible();

  // 2. Cria o usuário limpo
  await adminPage.goto('/admin/controle-usuarios');
  await adminPage.getByRole('button', { name: 'Novo Usuário' }).click();
  
  await adminPage.getByPlaceholder('Digite o nome do usuário').fill('Usuário Limpo E2E');
  await adminPage.getByPlaceholder('seu@email.com').fill(emailUsuario);
  await adminPage.locator('input[type="date"]').fill('1990-01-15');
  
  await adminPage.getByPlaceholder('000.000.000-00').fill(novoCpf); 
  await adminPage.getByPlaceholder('000000/UF').fill(generateCRM('DF'));
  
  await adminPage.getByPlaceholder('Digite sua senha').fill(senhaUsuario);
  await adminPage.getByPlaceholder('Confirme sua senha').fill(senhaUsuario);

  await adminPage.getByRole('button', { name: 'Cadastrar' }).click();
  await expect(adminPage.getByText(/usuário cadastrado com sucesso/i)).toBeVisible();

  // 3. Fecha o navegador do admin
  await context.close();
  
  // Devolve as credenciais recém-criadas para o teste usar
  return { email: emailUsuario, senha: senhaUsuario };
}