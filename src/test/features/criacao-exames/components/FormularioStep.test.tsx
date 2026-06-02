import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormularioStep } from '@/features/criacao-exames/components/FormularioStep';
import type { ComorbidadesFormValue } from '@/features/criacao-exames/components/Comorbidades';

// Mocks das funções repassadas via props
const mockSetters = {
  setNomeCompleto: vi.fn(),
  setDataNascimento: vi.fn(),
  setSexo: vi.fn(),
  setCpf: vi.fn(),
  setComorbidades: vi.fn(),
  setDescricao: vi.fn(),
};

const mockClearFieldError = vi.fn();
const mockOnBack = vi.fn();
const mockOnSubmit = vi.fn((e) => e.preventDefault());

// Estado inicial padrão com todas as propriedades exatas do contrato
const defaultFormData = {
  nomeCompleto: '',
  dataNascimento: '',
  sexo: '' as const,
  cpf: '',
  comorbidades: {
    diabetes: false,
    diabetesUsoInsulina: false,
    diabetesControlado: false,
    hipertensao: false,
    hipertensaoControlada: false,
    altaMiopia: false,
    glaucoma: false,
    usoHidroxicloroquina: false,
    uveite: false,
    catarata: false,
    outrasComorbidades: false,
    qualidadeTecnicaDificuldade: false,
  } as ComorbidadesFormValue, 
  descricao: '',
};

const defaultErrors = { global: null, fields: {} };

describe('FormularioStep', () => {
  it('deve exibir o alerta de revisão quando isDicom for true', () => {
    render(
      <FormularioStep
        isDicom={true}
        formData={defaultFormData}
        setters={mockSetters}
        errors={defaultErrors}
        clearFieldError={mockClearFieldError}
        isPending={false}
        canSubmit={true}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />
    );
    
    // Valida se o alerta condicional DICOM está na tela
    expect(screen.getByText(/Metadados extraídos automaticamente/i)).toBeDefined();
  });

  it('não deve exibir o alerta de revisão quando isDicom for false', () => {
    render(
      <FormularioStep
        isDicom={false}
        formData={defaultFormData}
        setters={mockSetters}
        errors={defaultErrors}
        clearFieldError={mockClearFieldError}
        isPending={false}
        canSubmit={true}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />
    );
    
    // Valida ausência do alerta DICOM no fluxo manual
    expect(screen.queryByText(/Metadados extraídos automaticamente/i)).toBeNull();
  });

  it('deve desabilitar o botão de salvar quando canSubmit for false', () => {
    render(
      <FormularioStep
        isDicom={false}
        formData={defaultFormData}
        setters={mockSetters}
        errors={defaultErrors}
        clearFieldError={mockClearFieldError}
        isPending={false}
        canSubmit={false} // Form inválido
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Salvar Exame/i });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('deve alterar o texto do botão e desabilitá-lo quando isPending for true', () => {
    render(
      <FormularioStep
        isDicom={false}
        formData={defaultFormData}
        setters={mockSetters}
        errors={defaultErrors}
        clearFieldError={mockClearFieldError}
        isPending={true} // Salvamento em andamento
        canSubmit={true}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Salvando.../i });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('deve acionar os setters e clearFieldError ao alterar um input', () => {
    render(
      <FormularioStep
        isDicom={false}
        formData={defaultFormData}
        setters={mockSetters}
        errors={{ global: null, fields: { nomeCompleto: 'Erro antigo' } }}
        clearFieldError={mockClearFieldError}
        isPending={false}
        canSubmit={false}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />
    );

    const inputNome = screen.getByLabelText(/Nome do Paciente/i);
    
    // Simula interação do usuário
    fireEvent.change(inputNome, { target: { value: 'Paciente Teste' } });

    // Valida comunicação com o hook pai
    expect(mockSetters.setNomeCompleto).toHaveBeenCalledWith('Paciente Teste');
    expect(mockClearFieldError).toHaveBeenCalledWith('nomeCompleto');
  });

  it('deve acionar onBack ao clicar no botão Voltar', () => {
    render(
      <FormularioStep
        isDicom={false}
        formData={defaultFormData}
        setters={mockSetters}
        errors={defaultErrors}
        clearFieldError={mockClearFieldError}
        isPending={false}
        canSubmit={true}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
      />
    );

    const backBtn = screen.getByRole('button', { name: /Voltar/i });
    fireEvent.click(backBtn);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});