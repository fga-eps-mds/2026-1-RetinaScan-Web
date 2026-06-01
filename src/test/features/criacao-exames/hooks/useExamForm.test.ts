import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useExamForm } from '@/features/criacao-exames/hooks/useExamForm';
import { validateCPF } from '@/utils/validators/cpf';

// Mock da função externa de validação de CPF para isolar o teste do hook
vi.mock('@/utils/validators/cpf', () => ({
  validateCPF: vi.fn(),
}));

describe('useExamForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com o estado padrão vazio', () => {
    const { result } = renderHook(() => useExamForm());

    expect(result.current.formData.nomeCompleto).toBe('');
    expect(result.current.formData.dataNascimento).toBe('');
    expect(result.current.formData.sexo).toBe('');
    expect(result.current.formData.cpf).toBe('');
    expect(result.current.formData.descricao).toBe('');
    
    // Valida se a factory inicializou as comorbidades corretamente
    expect(result.current.formData.comorbidades.diabetes).toBe(false);
    expect(result.current.formData.comorbidades.altaMiopia).toBe(false);
  });

  it('deve atualizar os campos básicos corretamente via setters', () => {
    const { result } = renderHook(() => useExamForm());

    act(() => {
      result.current.setters.setNomeCompleto('João da Silva');
      result.current.setters.setSexo('MASCULINO');
      result.current.setters.setDescricao('Exame de rotina');
    });

    expect(result.current.formData.nomeCompleto).toBe('João da Silva');
    expect(result.current.formData.sexo).toBe('MASCULINO');
    expect(result.current.formData.descricao).toBe('Exame de rotina');
  });

  it('deve formatar o CPF corretamente enquanto o usuário digita', () => {
    const { result } = renderHook(() => useExamForm());

    act(() => {
      // Envia uma string crua e longa para testar o slice e a máscara
      result.current.setters.setCpf('123456789019999');
    });

    // Deve truncar em 11 dígitos numéricos e aplicar a máscara
    expect(result.current.formData.cpf).toBe('123.456.789-01');
  });

  it('deve validar isCpfComplete e chamar validateCPF apenas quando estiver completo', () => {
    (validateCPF as Mock).mockReturnValue(true);
    const { result } = renderHook(() => useExamForm());

    // CPF incompleto
    act(() => { result.current.setters.setCpf('123456789'); });
    
    expect(result.current.validations.isCpfComplete).toBe(false);
    expect(result.current.validations.isCpfValid).toBe(false);
    expect(validateCPF).not.toHaveBeenCalled();

    // CPF completo (14 caracteres com máscara)
    act(() => { result.current.setters.setCpf('12345678901'); });

    expect(result.current.validations.isCpfComplete).toBe(true);
    expect(result.current.validations.isCpfValid).toBe(true);
    expect(validateCPF).toHaveBeenCalledWith('123.456.789-01');
  });

  it('deve validar datas de nascimento corretas (isNascimentoValid)', () => {
    const { result } = renderHook(() => useExamForm());

    // Data válida (Meio-dia para evitar bug de fuso horário)
    act(() => { result.current.setters.setDataNascimento('1990-05-15T12:00:00'); });
    expect(result.current.validations.isNascimentoValid).toBe(true);

    // Limite inferior (1900 - Meio-dia)
    act(() => { result.current.setters.setDataNascimento('1900-01-01T12:00:00'); });
    expect(result.current.validations.isNascimentoValid).toBe(true);
  });

  it('deve invalidar datas de nascimento fora do range permitido', () => {
    const { result } = renderHook(() => useExamForm());

    // Anterior a 1900
    act(() => { result.current.setters.setDataNascimento('1899-12-31T12:00:00'); });
    expect(result.current.validations.isNascimentoValid).toBe(false);

    // Futuro (ano superior ao atual)
    const futureYear = new Date().getFullYear() + 1;
    act(() => { result.current.setters.setDataNascimento(`${futureYear}-01-01T12:00:00`); });
    expect(result.current.validations.isNascimentoValid).toBe(false);

    // Data vazia ou inválida
    act(() => { result.current.setters.setDataNascimento(''); });
    expect(result.current.validations.isNascimentoValid).toBe(false);
  });

  it('deve resetar todo o formulário para o estado inicial ao chamar resetForm', () => {
    const { result } = renderHook(() => useExamForm());

    // Suja o estado
    act(() => {
      result.current.setters.setNomeCompleto('Paciente X');
      result.current.setters.setCpf('11122233344');
      result.current.setters.setComorbidades({ 
        ...result.current.formData.comorbidades, 
        diabetes: true 
      });
    });

    // Executa o reset
    act(() => {
      result.current.resetForm();
    });

    // Valida a limpeza total
    expect(result.current.formData.nomeCompleto).toBe('');
    expect(result.current.formData.cpf).toBe('');
    expect(result.current.formData.comorbidades.diabetes).toBe(false);
  });
});