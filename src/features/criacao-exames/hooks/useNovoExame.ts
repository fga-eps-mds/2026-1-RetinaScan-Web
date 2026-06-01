import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useCreateExam } from '../hooks/useCreateExam';
import { parseApiError } from '../api/parseApiError';
import { useExamForm } from './useExamForm';
import { useExamUpload } from './useExamUpload';
import type { SexoExame } from '../types/exam';

export const useNovoExame = () => {
  const navigate = useNavigate();
  const createExamMutation = useCreateExam();

  // Estados de controle locais do Maestro
  const [step, setStep] = useState<'UPLOAD' | 'FORM'>('UPLOAD');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. Instancia o Trabalhador de Formulário (Cuida de textos e validações)
  const form = useExamForm();

  // 2. Instancia o Trabalhador de Upload (Lê DICOM e repassa para o Formulário)
  const upload = useExamUpload((mappedData) => {
    if (mappedData.sexo) {
      form.setters.setSexo(mappedData.sexo as SexoExame);
    }
    if (mappedData.dtNascimento) {
      // Converte o formato do DICOM DD-MM-YYYY para o HTML5 YYYY-MM-DD
      const [d, m, y] = mappedData.dtNascimento.split('-');
      if (y && m && d) form.setters.setDataNascimento(`${y}-${m}-${d}`);
    }
    if (mappedData.comorbidades) {
      form.setters.setDescricao((prev) => 
        prev ? `${prev}\n\nComorbidades DICOM: ${mappedData.comorbidades}` : `Comorbidades DICOM: ${mappedData.comorbidades}`
      );
    }
  });

  // 3. Função que aciona a API quando o formulário é enviado
  const handleCreateExam = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); 
    setFieldErrors({});

    try {
      // TODO (Integração): Alterar para FormData e fazer append de `upload.imagens` quando a API unificada chegar
      const exam = await createExamMutation.mutateAsync({
        nomeCompleto: form.formData.nomeCompleto,
        cpf: form.formData.cpf.replaceAll(/\D/g, ''),
        sexo: form.formData.sexo as SexoExame,
        dtNascimento: form.formData.dataNascimento,
        dtHora: new Date().toISOString(),
        comorbidades: form.formData.comorbidades,
        descricao: form.formData.descricao.trim() ? form.formData.descricao : undefined,
      });

      toast.success('Exame criado com sucesso. Redirecionando para upload...');
      
      // Limpa tudo após o sucesso
      form.resetForm();
      upload.setImagens([]);
      setStep('UPLOAD');
      
      // TODO (Integração): Remover este redirecionamento quando a tela antiga de upload for descontinuada
      navigate(`/exames/upload/${exam.id}`);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: unknown } };
      const { message, fieldErrors } = parseApiError(apiError?.response?.data);
      setError(message); 
      setFieldErrors(fieldErrors); 
      toast.error(message);
    }
  };

  // Função para limpar erros individuais quando o usuário digita
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => { 
      const next = { ...prev }; 
      delete next[field]; 
      return next; 
    });
  };

  // --- Orquestração de Validações ---
  
  const showCpfError = form.validations.isCpfComplete && !form.validations.isCpfValid;
  const showDateError = Boolean(form.formData.dataNascimento) && !form.validations.isNascimentoValid;

  // Junta os erros da API com os erros em tempo real do frontend
  const combinedFieldErrors = {
    ...fieldErrors,
    ...(showCpfError ? { cpf: 'CPF inválido.' } : {}),
    ...(showDateError ? { dtNascimento: 'Data inválida. Verifique o ano.' } : {})
  };

  const isFormValid = Boolean(
    form.formData.nomeCompleto && 
    form.validations.isNascimentoValid && 
    form.formData.sexo && 
    form.validations.isCpfValid
  );

  const canProceedToForm = upload.imagens.length > 0;
  const canSubmitFinal = canProceedToForm && isFormValid;

  // --- Retorno exato do que a interface `NovoExame.tsx` espera ---
  return {
    step,
    setStep,
    isDicom: upload.isDicom,
    formData: form.formData,
    setters: form.setters,
    errors: { global: error, fields: combinedFieldErrors },
    clearFieldError,
    isPending: createExamMutation.isPending,
    canProceedToForm,
    canSubmitFinal,
    handleImageChange: upload.handleImageChange,
    handleCreateExam
  };
};