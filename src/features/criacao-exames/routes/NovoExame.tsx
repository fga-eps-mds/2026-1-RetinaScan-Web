import { useState } from 'react';
import { useCreateExam } from '../hooks/useCreateExam';
import { parseApiError } from '../api/parseApiError';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import type { SexoExame } from '../types/exam';
import { parseDicomFile } from '@/utils/dicom/parseDicomFile';
import { mapDicomToExamForm } from '@/utils/dicom/mapDicomToForm';
import { UploadStep } from '../components/UploadStep';
import { FormularioStep } from '../components/FormularioStep';
import type { ComorbidadesFormValue } from '../components/Comorbidades';

/**
 * Utilitário para formatar o CPF com a máscara padrão (000.000.000-00).
 * Limpa qualquer caractere não numérico antes de aplicar a RegEx.
 */
const formatCpf = (value: string): string => {
  const digits = value.replaceAll(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Factory function para gerar o estado inicial limpo do objeto de comorbidades.
 * Centraliza os valores default para facilitar o reset do formulário.
 */
const createInitialComorbidades = (): ComorbidadesFormValue => ({
  diabetes: false, diabetesAnos: undefined, diabetesUsoInsulina: false, diabetesControlado: false,
  hipertensao: false, hipertensaoControlada: false, altaMiopia: false, glaucoma: false,
  usoHidroxicloroquina: false, uveite: false, catarata: false, outrasComorbidades: false,
  outrasComorbidadesDescricao: undefined, qualidadeTecnicaDificuldade: false,
});

// Tipagem para controle interno das imagens anexadas pelo usuário antes do envio
type UploadedImage = { file: File; lateralidade: 'OD' | 'OE'; preview: string; };

const NovoExame = () => {
  const navigate = useNavigate();
  const createExamMutation = useCreateExam();

  // --- Estados de Controle do Fluxo (Wizard) ---
  // Controla qual etapa está visível para o usuário (Upload da imagem ou Formulário de dados)
  const [step, setStep] = useState<'UPLOAD' | 'FORM'>('UPLOAD');
  // Armazena as imagens em memória e gera previews locais via URL.createObjectURL
  const [imagens, setImagens] = useState<UploadedImage[]>([]);
  // Flag que determina se o fluxo atual está utilizando dados automatizados ou 100% manuais
  const [isDicom, setIsDicom] = useState(false);

  // --- Estados do Formulário (Dados do Paciente) ---
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<SexoExame | ''>('');
  const [cpf, setCpf] = useState('');
  const [comorbidades, setComorbidades] = useState<ComorbidadesFormValue>(createInitialComorbidades);
  const [descricao, setDescricao] = useState('');

  // --- Estados de Tratamento de Erro da API ---
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Remove o erro de um campo específico assim que o usuário volta a digitar nele.
   */
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  /**
   * Reseta todos os estados para seus valores iniciais.
   * Utilizado após o sucesso da submissão para limpar a tela.
   */
  const resetForm = () => {
    setNomeCompleto(''); setDataNascimento(''); setSexo(''); setCpf('');
    setComorbidades(createInitialComorbidades()); setDescricao('');
    setError(null); setFieldErrors({}); setImagens([]); setStep('UPLOAD');
  };

  /**
   * Handler principal do passo de UPLOAD.
   * Responsável por guardar a imagem, gerar o preview e ramificar a lógica caso seja um arquivo DICOM.
   */
  const handleImageChange = async (file: File | null, lateralidade: 'OD' | 'OE') => {
    // Se o usuário cancelou a seleção ou removeu a imagem, filtra a lateralidade correspondente do array
    if (!file) {
      setImagens((prev) => prev.filter((img) => img.lateralidade !== lateralidade));
      return;
    }

    // Gera um blob URL temporário para exibir a miniatura da imagem selecionada
    const preview = URL.createObjectURL(file);
    setImagens((prev) => {
      const filtered = prev.filter((img) => img.lateralidade !== lateralidade);
      return [...filtered, { file, lateralidade, preview }];
    });

    // Identificação do tipo de arquivo e ramificação do fluxo (DICOM vs. Formatos tradicionais)
    if (file.name.toLowerCase().endsWith('.dcm') || file.type === 'application/dicom') {
      try {
        // Aciona o interpretador para extrair as tags do binário DICOM
        const dicomData = await parseDicomFile(file);
        const mappedData = mapDicomToExamForm(dicomData);

        // Popula automaticamente os estados do React com os metadados extraídos
        if (mappedData.sexo) setSexo(mappedData.sexo as SexoExame);
        
        // Conversão necessária do formato DD-MM-YYYY (DICOM) para YYYY-MM-DD (Input date do HTML5)
        if (mappedData.dtNascimento) {
          const [d, m, y] = mappedData.dtNascimento.split('-');
          if (y && m && d) setDataNascimento(`${y}-${m}-${d}`);
        }
        
        // Concatena as comorbidades extraídas do DICOM no campo de prontuário (descrição)
        if (mappedData.comorbidades) {
          setDescricao((prev) => prev ? `${prev}\n\nComorbidades DICOM: ${mappedData.comorbidades}` : `Comorbidades DICOM: ${mappedData.comorbidades}`);
        }

        setIsDicom(true);
        toast.success('Dados extraídos do arquivo DICOM com sucesso! Revise as informações.');
      } catch (err) {
        // Fallback: Se o DICOM estiver corrompido, trata silenciosamente e libera o preenchimento manual
        console.error(err);
        toast.warning('Não foi possível ler os metadados deste DICOM. Você pode preencher os dados manualmente.');
        setIsDicom(false);
      }
    } else {
      // Cenário B: Imagem tradicional (JPEG/PNG). O formulário permanece em branco.
      setIsDicom(false);
    }
  };

  /**
   * Submissão final do exame para a API.
   */
  const handleCreateExam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); setFieldErrors({});

    try {
      // Montagem do payload aderente ao contrato da API atual.
      // O CPF tem sua formatação (pontos e traço) limpa via regex antes do envio.
      const exam = await createExamMutation.mutateAsync({
        nomeCompleto,
        cpf: cpf.replaceAll(/\D/g, ''),
        sexo: sexo as SexoExame,
        dtNascimento: dataNascimento,
        dtHora: new Date().toISOString(),
        comorbidades,
        descricao: descricao.trim() ? descricao : undefined,
      });

      toast.success('Exame criado com sucesso. Redirecionando para upload...');
      resetForm();
      
      // OBS: Atualmente a rota antiga de upload de imagens é mantida após a criação do registro base
      navigate(`/exames/upload/${exam.id}`);
    } catch (err: unknown) {
      // Interceptação de erros 400/500 da API para mapear nos campos correspondentes do formulário
      const apiError = err as { response?: { data?: unknown } };
      const { message, fieldErrors } = parseApiError(apiError?.response?.data);
      setError(message); setFieldErrors(fieldErrors); toast.error(message);
    }
  };

  // --- Regras de Validação Dinâmicas da Interface ---

  // Passo 1: Só permite avançar para o formulário se houver ao menos 1 arquivo na memória
  const canProceedToForm = imagens.length > 0;
  
  // Passo 2: Trava de integridade dos dados obrigatórios exigidos pelo backend atual
  const isFormValid = Boolean(nomeCompleto && dataNascimento && sexo && cpf.length === 14);
  
  // O botão de envio final só é habilitado se ambas as etapas estiverem corretas
  const canSubmitFinal = canProceedToForm && isFormValid;

  return (
    <div className="h-dvh overflow-y-auto px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        
        <header className="text-center">
          <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">Novo Exame</h2>
          <p className="text-md text-muted-foreground">
            {step === 'UPLOAD' ? 'Inicie fazendo o upload das imagens da retina.' : 'Revise e complete os dados do paciente (opcional).'}
          </p>
        </header>

        {/* Orquestração dos Passos: Condiciona a renderização com base no estado `step` */}
        {step === 'UPLOAD' && (
          <UploadStep 
            canProceed={canProceedToForm}
            onImageChange={handleImageChange}
            onNext={() => setStep('FORM')}
          />
        )}

        {step === 'FORM' && (
          <FormularioStep 
            isDicom={isDicom}
            formData={{ nomeCompleto, dataNascimento, sexo, cpf, comorbidades, descricao }}
            // Agrupa os setters repassando formatações necessárias diretamente nas props (ex: máscara do CPF)
            setters={{ setNomeCompleto, setDataNascimento, setSexo, setCpf: (val) => setCpf(formatCpf(val)), setComorbidades, setDescricao }}
            errors={{ global: error, fields: fieldErrors }}
            clearFieldError={clearFieldError}
            isPending={createExamMutation.isPending}
            canSubmit={canSubmitFinal}
            onBack={() => setStep('UPLOAD')}
            onSubmit={handleCreateExam}
          />
        )}

      </div>
    </div>
  );
};

export default NovoExame;