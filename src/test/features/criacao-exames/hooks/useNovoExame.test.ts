import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useNovoExame } from '@/features/criacao-exames/hooks/useNovoExame';
import { api } from '@/shared/api';
import { toast } from 'sonner';
import { parseApiError } from '@/features/criacao-exames/api/parseApiError';
import { useNavigate } from 'react-router';
import { useCreateExam } from '@/features/criacao-exames/hooks/useCreateExam';
import { useExamForm } from '@/features/criacao-exames/hooks/useExamForm';
import { useExamUpload } from '@/features/criacao-exames/hooks/useExamUpload';

// --- Mocks de Dependências Externas ---
vi.mock('@/shared/api', () => ({
  api: { post: vi.fn() }
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('react-router', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@/features/criacao-exames/api/parseApiError', () => ({
  parseApiError: vi.fn()
}));

vi.mock('@/features/criacao-exames/hooks/useCreateExam', () => ({
  useCreateExam: vi.fn()
}));

vi.mock('@/features/criacao-exames/hooks/useExamForm', () => ({
  useExamForm: vi.fn()
}));

vi.mock('@/features/criacao-exames/hooks/useExamUpload', () => ({
  useExamUpload: vi.fn()
}));

describe('useNovoExame Hook', () => {
  const mockNavigate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockResetForm = vi.fn();
  const mockSetImagens = vi.fn();

  // Objetos utilitários para simular o estado dos hooks filhos
  const mockSetters = {
    setNomeCompleto: vi.fn(),
    setDataNascimento: vi.fn(),
    setSexo: vi.fn(),
    setCpf: vi.fn(),
    setComorbidades: vi.fn(),
    setDescricao: vi.fn(),
  };

  const defaultFormData = {
    nomeCompleto: 'Paciente Teste',
    dataNascimento: '1990-01-01',
    sexo: 'MASCULINO',
    cpf: '111.222.333-44',
    comorbidades: {} as any,
    descricao: 'Descrição de teste'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup padrão dos mocks para o cenário feliz
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useCreateExam as Mock).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });
    
    (useExamForm as Mock).mockReturnValue({
      formData: defaultFormData,
      setters: mockSetters,
      validations: { isCpfValid: true, isNascimentoValid: true, isCpfComplete: true },
      resetForm: mockResetForm
    });

    (useExamUpload as Mock).mockReturnValue({
      // Simula uma imagem pronta para envio
      imagens: [{ file: new File([''], 'teste.dcm'), lateralidade: 'OD' }],
      setImagens: mockSetImagens,
      handleImageChange: vi.fn()
    });
  });

  // --- Testes de Upload (Passo 1) ---

  it('deve extrair metadados DICOM e avançar para a etapa FORM com isDicom = true', async () => {
    // Simula resposta de sucesso da API para imagem DICOM
    (api.post as Mock).mockResolvedValueOnce({
      data: {
        metadados: {
          nomeCompleto: 'João da Silva',
          sexo: 'MASCULINO',
          dtNascimento: '1980-05-10',
          descricao: 'Metadados lidos'
        },
        imagens: [{ uploadId: 'id-123', lateralidade: 'OD' }]
      }
    });

    const { result } = renderHook(() => useNovoExame());

    await act(async () => {
      await result.current.handleUploadAndNext();
    });

    // Valida preenchimento dos setters
    expect(mockSetters.setNomeCompleto).toHaveBeenCalledWith('João da Silva');
    expect(mockSetters.setSexo).toHaveBeenCalledWith('MASCULINO');
    expect(mockSetters.setDataNascimento).toHaveBeenCalledWith('1980-05-10');
    expect(mockSetters.setDescricao).toHaveBeenCalledWith('Metadados lidos');

    // Valida controle de etapa
    expect(result.current.isDicom).toBe(true);
    expect(result.current.step).toBe('FORM');
    expect(toast.success).toHaveBeenCalledWith('Metadados do paciente extraídos com sucesso!');
  });

  it('deve avançar para a etapa FORM com isDicom = false caso não existam metadados (JPEG)', async () => {
    // Simula resposta da API para imagem JPEG (sem metadados)
    (api.post as Mock).mockResolvedValueOnce({
      data: {
        metadados: undefined,
        imagens: [{ uploadId: 'id-456', lateralidade: 'OD' }]
      }
    });

    const { result } = renderHook(() => useNovoExame());

    await act(async () => {
      await result.current.handleUploadAndNext();
    });

    // Não deve chamar setters de preenchimento e não deve exibir toast de sucesso DICOM
    expect(mockSetters.setNomeCompleto).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    
    expect(result.current.isDicom).toBe(false);
    expect(result.current.step).toBe('FORM');
  });

  it('não deve fazer nada se não houver imagens selecionadas', async () => {
    // Sobrescreve o mock para simular array vazio
    (useExamUpload as Mock).mockReturnValueOnce({ imagens: [] });
    
    const { result } = renderHook(() => useNovoExame());

    await act(async () => {
      await result.current.handleUploadAndNext();
    });

    expect(api.post).not.toHaveBeenCalled();
    expect(result.current.step).toBe('UPLOAD');
  });

  it('deve manter na etapa UPLOAD e mostrar toast em caso de erro da API', async () => {
    // Simula erro de validação vindo do backend
    (api.post as Mock).mockRejectedValueOnce({
      response: { data: { fields: [{ message: 'Arquivo corrompido' }] } }
    });

    const { result } = renderHook(() => useNovoExame());

    await act(async () => {
      await result.current.handleUploadAndNext();
    });

    expect(result.current.step).toBe('UPLOAD'); // Não avança
    expect(toast.error).toHaveBeenCalledWith('Arquivo corrompido');
  });

  // --- Testes de Criação de Exame (Passo 2) ---

  it('deve criar o exame com sucesso, limpar os forms e navegar para /exames', async () => {
    // Simula o sucesso da mutation do React Query
    mockMutateAsync.mockResolvedValueOnce({});
    
    const { result } = renderHook(() => useNovoExame());

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleCreateExam(mockEvent);
    });

    // Valida payload enviado para o backend (CPF sem pontuação)
    expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      nomeCompleto: 'Paciente Teste',
      cpf: '11122233344', // CPF limpo
      sexo: 'MASCULINO',
      dtNascimento: '1990-01-01',
    }));

    // Valida o reset total do fluxo
    expect(toast.success).toHaveBeenCalledWith('Exame criado com sucesso!');
    expect(mockResetForm).toHaveBeenCalledTimes(1);
    expect(mockSetImagens).toHaveBeenCalledWith([]);
    expect(result.current.step).toBe('UPLOAD'); // Volta para tela inicial internamente
    expect(mockNavigate).toHaveBeenCalledWith('/exames'); // Redireciona
  });

  it('deve tratar erros de criação de exame mapeando-os com parseApiError', async () => {
    const mockApiError = new Error('Erro na rede');
    mockMutateAsync.mockRejectedValueOnce(mockApiError);
    
    // CORREÇÃO: Type casting 'as Record<string, string>' para aceitar qualquer chave
    (parseApiError as Mock).mockReturnValue({
      message: 'Dados inválidos',
      fieldErrors: { cpf: 'CPF já cadastrado' } as Record<string, string>
    });

    const { result } = renderHook(() => useNovoExame());
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleCreateExam(mockEvent);
    });

    expect(toast.error).toHaveBeenCalledWith('Dados inválidos');
    expect(result.current.errors.global).toBe('Dados inválidos');
    expect(result.current.errors.fields.cpf).toBe('CPF já cadastrado');
  });

  // --- Testes de Utilitários de Erro ---

  it('deve combinar erros do formulário com erros injetados pelo backend', () => {
    // Força o form a indicar que o CPF e Data estão com erro lógico de preenchimento
    (useExamForm as Mock).mockReturnValueOnce({
      formData: { ...defaultFormData, dataNascimento: '2050-01-01' },
      validations: { isCpfComplete: true, isCpfValid: false, isNascimentoValid: false }
    });

    const { result } = renderHook(() => useNovoExame());

    // Os erros combinados devem refletir os alertas locais
    expect(result.current.errors.fields.cpf).toBe('CPF inválido.');
    expect(result.current.errors.fields.dtNascimento).toBe('Data inválida. Verifique o ano.');
  });

  it('deve limpar um erro de campo específico quando clearFieldError for chamado', async () => {
    // Configura o parseApiError para jogar um erro inicial
    mockMutateAsync.mockRejectedValueOnce({});
    
    // CORREÇÃO: Type casting 'as Record<string, string>' para aceitar 'nomeCompleto'
    (parseApiError as Mock).mockReturnValueOnce({
      message: 'Erro',
      fieldErrors: { nomeCompleto: 'Obrigatório', cpf: 'Inválido' } as Record<string, string>
    });

    const { result } = renderHook(() => useNovoExame());
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;

    // 1. Gera o erro
    await act(async () => {
      await result.current.handleCreateExam(mockEvent);
    });
    // Adicionamos "as Record<string, string>" para forçar o TS a enxergar outras propriedades
    expect((result.current.errors.fields as Record<string, string>).nomeCompleto).toBe('Obrigatório');

    // 2. Limpa o erro do Nome
    act(() => {
      result.current.clearFieldError('nomeCompleto');
    });

    // 3. Verifica se apenas o CPF continuou com erro
    expect((result.current.errors.fields as Record<string, string>).nomeCompleto).toBeUndefined();
    expect(result.current.errors.fields.cpf).toBe('Inválido');
  });
});