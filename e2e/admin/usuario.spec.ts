import { test, expect, Page } from '@playwright/test';
import { adminCredentials } from '../support/credentials';
import { generateCRM, uniqueCPF, uniqueEmail } from '../support/usuario';

test.describe('cadastro de usuários', () => {
  test('cadastro bem-sucedido fecha o modal e mostra feedback de sucesso', async ({ page }) => {
    // Autentica como administrador e acessa a página de controle
    await loginAsAdmin(page);

    // Aciona a abertura do modal de criação
    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    
    // Aguarda a renderização do modal para garantir que a interface está pronta para interação
    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();

    // Preenche os dados obrigatórios gerando um e-mail único para evitar conflitos no banco de dados
    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: uniqueEmail(),
      senha: 'SenhaForte123',
      confirmarSenha: 'SenhaForte123',
    });

    // Submete o formulário
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Valida o feedback visual de sucesso
    await expect(page.getByText(/usuário cadastrado com sucesso/i)).toBeVisible();
    
    // Confirma a mudança de estado da interface (modal fechado automaticamente)
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

    // Preenche o formulário forçando uma divergência no campo de confirmação de senha
    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: uniqueEmail(),
      senha: 'SenhaForte123',
      confirmarSenha: 'outraSenha123',
    });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Valida se a validação do frontend atuou corretamente exibindo o erro
    await expect(
      page.getByText('As senhas não coincidem.').first()
    ).toBeVisible();

    // Garante que o modal permaneceu aberto para o usuário corrigir os dados
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

    // Insere um formato de e-mail inválido para testar a validação de formato (regex/máscara)
    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: 'nao-e-email',
      senha: 'SenhaForte123',
      confirmarSenha: 'SenhaForte123',
    });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Garante que a submissão foi bloqueada no frontend e o modal continuou aberto
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

    // Tenta cadastrar utilizando um e-mail que comprovadamente já existe na base (admin)
    await fillUserForm(page, {
      nome: 'Usuário E2E',
      email: adminCredentials.email,
      senha: 'SenhaForte123',
      confirmarSenha: 'SenhaForte123',
    });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Verifica se o modal se mantém aberto após a falha de requisição
    await expect(
      page.getByRole('heading', { name: /cadastro de usuário/i })
    ).toBeVisible();

    // Valida se o backend rejeitou a duplicidade e se a interface exibiu o erro de forma clara
    await expect(
      page.getByText('Email já cadastrado').first()
    ).toBeVisible();
  });
});

// --- Funções Auxiliares (Helpers) ---

// Isola o fluxo de autenticação e navegação inicial repetitivo
async function loginAsAdmin(page: Page) {
  await page.goto('/login');

  await page.getByPlaceholder('seu@email.com').fill(adminCredentials.email);
  await page.getByPlaceholder('Digite sua senha').fill(adminCredentials.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Garante que o login terminou antes de tentar navegar para rotas protegidas
  await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();
  await page.goto('/admin/controle-usuarios');
}

// Abstração do preenchimento do formulário para manter os testes limpos (DRY)
async function fillUserForm(page: Page, data: {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}) {
  await page.getByPlaceholder('Digite o nome do usuário').fill(data.nome);
  await page.getByPlaceholder('seu@email.com').fill(data.email);
  await page.locator('input[type="date"]').fill('1990-01-15');
  
  // Utiliza os geradores dinâmicos para evitar falsos positivos de duplicidade de CPF/CRM
  await page.getByPlaceholder('000.000.000-00').fill(uniqueCPF);
  await page.getByPlaceholder('000000/UF').fill(generateCRM());
  
  await page.getByPlaceholder('Digite sua senha').fill(data.senha);
  await page.getByPlaceholder('Confirme sua senha').fill(data.confirmarSenha);
}