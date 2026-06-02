import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NovoExame from '@/features/criacao-exames/routes/NovoExame'; 
import { useNovoExame } from '@/features/criacao-exames/hooks/useNovoExame';

// Mantemos APENAS o mock do Hook (Cérebro). 
// Removemos os mocks dos componentes filhos, deixando o React renderizar a UI real.
vi.mock('@/features/criacao-exames/hooks/useNovoExame');

describe('NovoExame Orquestrador', () => {
  const mockUseNovoExame = vi.mocked(useNovoExame);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Retorno padrão do hook (Cenário Inicial - Etapa UPLOAD)
    mockUseNovoExame.mockReturnValue({
      step: 'UPLOAD',
      setStep: vi.fn(),
      isDicom: false,
      formData: {
        nomeCompleto: '', 
        dataNascimento: '', 
        sexo: '' as any, 
        cpf: '', 
        comorbidades: {
          diabetes: false, diabetesUsoInsulina: false, diabetesControlado: false,
          hipertensao: false, hipertensaoControlada: false, altaMiopia: false,
          glaucoma: false, usoHidroxicloroquina: false, uveite: false, catarata: false,
          outrasComorbidades: false, qualidadeTecnicaDificuldade: false,
        } as any, 
        descricao: ''
      },
      setters: {
        setNomeCompleto: vi.fn(), setDataNascimento: vi.fn(), setSexo: vi.fn(), 
        setCpf: vi.fn(), setComorbidades: vi.fn(), setDescricao: vi.fn()
      },
      errors: { global: null, fields: {} },
      clearFieldError: vi.fn(),
      isPending: false,
      isUploadingImagens: false,
      canProceedToForm: false,
      canSubmitFinal: false,
      handleImageChange: vi.fn(),
      handleUploadAndNext: vi.fn(),
      handleCreateExam: vi.fn(),
    });
  });

  it('deve renderizar a etapa de UPLOAD e o subtítulo correto no estado inicial', () => {
    render(<NovoExame />);
    
    // Valida Header
    expect(screen.getByText('Novo Exame')).toBeDefined();
    expect(screen.getByText('Inicie fazendo o upload das imagens da retina.')).toBeDefined();
    
    // Valida que o UploadStep REAL foi renderizado (procurando um texto exclusivo dele)
    expect(screen.getByText('Olho Direito (OD)')).toBeDefined();
    
    // Garante que o Formulário NÃO está na tela
    expect(screen.queryByLabelText('Nome do Paciente')).toBeNull();
  });

  it('deve renderizar a etapa de FORM e o subtítulo correto quando step for alterado', () => {
    // Simula o hook avançando o state da tela para 'FORM'
    mockUseNovoExame.mockReturnValue({
      ...mockUseNovoExame(),
      step: 'FORM'
    });

    render(<NovoExame />);
    
    // Valida Header
    expect(screen.getByText('Novo Exame')).toBeDefined();
    expect(screen.getByText('Revise e complete os dados do paciente (opcional).')).toBeDefined();
    
    // Valida que o FormularioStep REAL foi renderizado (procurando o input de Nome)
    expect(screen.getByLabelText('Nome do Paciente')).toBeDefined();
    
    // Garante que o componente de Upload NÃO está mais na tela
    expect(screen.queryByText('Olho Direito (OD)')).toBeNull();
  });
});