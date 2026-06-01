import { useState } from 'react';
import { validateCPF } from '@/utils/validators/cpf';
import type { SexoExame } from '../types/exam';
import type { ComorbidadesFormValue } from '../components/Comorbidades';

/**
 * Utilit para formatar o CPF com a máscara padrão (000.000.000-00).
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
 */
const createInitialComorbidades = (): ComorbidadesFormValue => ({
  diabetes: false, diabetesAnos: undefined, diabetesUsoInsulina: false, diabetesControlado: false,
  hipertensao: false, hipertensaoControlada: false, altaMiopia: false, glaucoma: false,
  usoHidroxicloroquina: false, uveite: false, catarata: false, outrasComorbidades: false,
  outrasComorbidadesDescricao: undefined, qualidadeTecnicaDificuldade: false,
});

export const useExamForm = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<SexoExame | ''>('');
  const [cpf, setCpf] = useState('');
  const [comorbidades, setComorbidades] = useState<ComorbidadesFormValue>(createInitialComorbidades());
  const [descricao, setDescricao] = useState('');

  // --- Validações em Tempo Real ---
  const isCpfComplete = cpf.length === 14;
  const isCpfValid = isCpfComplete ? validateCPF(cpf) : false;
  
  const isDateValid = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return false;
    const year = date.getFullYear();
    return year >= 1900 && year <= new Date().getFullYear();
  };
  const isNascimentoValid = isDateValid(dataNascimento);

  const resetForm = () => {
    setNomeCompleto('');
    setDataNascimento('');
    setSexo('');
    setCpf('');
    setComorbidades(createInitialComorbidades());
    setDescricao('');
  };

  return {
    formData: { nomeCompleto, dataNascimento, sexo, cpf, comorbidades, descricao },
    setters: { 
      setNomeCompleto, 
      setDataNascimento, 
      setSexo, 
      setCpf: (val: string) => setCpf(formatCpf(val)), 
      setComorbidades, 
      setDescricao 
    },
    validations: { isCpfValid, isNascimentoValid, isCpfComplete },
    resetForm
  };
};