import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useCreateExam } from '../hooks/useCreateExam';
import { parseApiError } from '../api/parseApiError';
import { useExamForm } from './useExamForm';
import { useExamUpload } from './useExamUpload';
import type { SexoExame } from '../types/exam';


import { api } from '@/shared/api'; 

export const useNovoExame = () => {
  const navigate = useNavigate();
  const createExamMutation = useCreateExam();

  const [step, setStep] = useState<'UPLOAD' | 'FORM'>('UPLOAD');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [isUploadingImagens, setIsUploadingImagens] = useState(false);
  const [isDicom, setIsDicom] = useState(false);
  
  // Tipagem estrita da lateralidade
  const [uploadedIds, setUploadedIds] = useState<{uploadId: string, lateralidade: 'OD' | 'OE'}[]>([]);

  const form = useExamForm();
  const upload = useExamUpload();

  // --- PASSO 1: Envia a imagem e processa no Backend ---
  const handleUploadAndNext = async () => {
    if (upload.imagens.length === 0) return;

    setIsUploadingImagens(true);
    
    try {
      const formPayload = new FormData();
      const od = upload.imagens.find(i => i.lateralidade === 'OD')?.file;
      const oe = upload.imagens.find(i => i.lateralidade === 'OE')?.file;

      if (od) formPayload.append('olhoDireito', od);
      if (oe) formPayload.append('olhoEsquerdo', oe);

      const response = await api.post('/api/exams/images', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { metadados, imagens } = response.data;

      // Mapeamento dos IDs retornados pelo backend
      setUploadedIds(imagens.map((img: any) => ({ 
        uploadId: img.uploadId, 
        lateralidade: img.lateralidade as 'OD' | 'OE'
      })));

      // Preenchimento automático se for DICOM
      if (metadados) {
        setIsDicom(true);
        if (metadados.nomeCompleto) form.setters.setNomeCompleto(metadados.nomeCompleto);
        if (metadados.sexo) form.setters.setSexo(metadados.sexo as SexoExame);
        if (metadados.dtNascimento) form.setters.setDataNascimento(metadados.dtNascimento);
        if (metadados.descricao) form.setters.setDescricao(metadados.descricao);
        
        toast.success('Metadados do paciente extraídos com sucesso!');
      } else {
        setIsDicom(false);
      }

      setStep('FORM'); 
    } catch (err: any) {
      // Captura mensagem específica de validação do Backend
      const serverMessage = err.response?.data?.fields?.[0]?.message;
      const displayMessage = serverMessage || 'Erro ao processar as imagens. Tente novamente.';
      
      console.error('Erro no upload:', err);
      toast.error(displayMessage);
    } finally {
      setIsUploadingImagens(false);
    }
  };

  // --- PASSO 2: Cria o exame final ---
  const handleCreateExam = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); 
    setFieldErrors({});

    try {
      await createExamMutation.mutateAsync({
        nomeCompleto: form.formData.nomeCompleto,
        cpf: form.formData.cpf.replaceAll(/\D/g, ''),
        sexo: form.formData.sexo as SexoExame,
        dtNascimento: form.formData.dataNascimento,
        dtHora: new Date().toISOString(),
        comorbidades: form.formData.comorbidades,
        descricao: form.formData.descricao.trim() ? form.formData.descricao : undefined,
        imagens: uploadedIds
      });

      toast.success('Exame criado com sucesso!');
      
      form.resetForm();
      upload.setImagens([]);
      setStep('UPLOAD');
      
      navigate('/exames'); 
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: unknown } };
      const { message, fieldErrors } = parseApiError(apiError?.response?.data);
      setError(message); 
      setFieldErrors(fieldErrors); 
      toast.error(message);
    }
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const showCpfError = form.validations.isCpfComplete && !form.validations.isCpfValid;
  const showDateError = Boolean(form.formData.dataNascimento) && !form.validations.isNascimentoValid;

  const combinedFieldErrors = {
    ...fieldErrors,
    ...(showCpfError ? { cpf: 'CPF inválido.' } : {}),
    ...(showDateError ? { dtNascimento: 'Data inválida. Verifique o ano.' } : {})
  };

  const isFormValid = Boolean(
    form.formData.nomeCompleto && form.validations.isNascimentoValid && 
    form.formData.sexo && form.validations.isCpfValid
  );

  const canProceedToForm = upload.imagens.length > 0;
  const canSubmitFinal = canProceedToForm && isFormValid;

  return {
    step,
    setStep,
    isDicom,
    formData: form.formData,
    setters: form.setters,
    errors: { global: error, fields: combinedFieldErrors },
    clearFieldError,
    isPending: createExamMutation.isPending,
    isUploadingImagens,
    canProceedToForm,
    canSubmitFinal,
    handleImageChange: upload.handleImageChange,
    handleUploadAndNext,
    handleCreateExam
  };
};