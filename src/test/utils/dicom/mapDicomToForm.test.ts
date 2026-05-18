import { describe, it, expect } from 'vitest';
import { mapDicomToExamForm } from '@/utils/dicom/mapDicomToForm';
import type { ExtractedDicomData } from '@/utils/dicom/dicom.types';

describe('Utilitário DICOM - mapDicomToExamForm', () => {
  
  it('Deve formatar os dados básicos corretamente (Datas, Hora e Sexo)', () => {
    const mockData = {
      patientSex: 'M',
      patientBirthDate: '19980521',
      seriesDate: '20260511',
      seriesTime: '143522', 
      patientComments: null
    } as ExtractedDicomData;

    const result = mapDicomToExamForm(mockData);

    expect(result.sexo).toBe('MASCULINO');
    expect(result.dtNascimento).toBe('21-05-1998');
    expect(result.dtHora).toBe('2026-05-11T14:35:22');
  });

  it('Deve extrair as comorbidades quando vierem diretamente na raiz do JSON (Exemplo Real)', () => {
    const mockData = {
      patientComments: {
        hypertension: true,
        smoker: false,
        glaucoma: false,
        cataract: true
      }
    } as ExtractedDicomData;

    const result = mapDicomToExamForm(mockData);
    
    expect(result.comorbidades).toBe('Hipertensão, Catarata');
  });

  it('Deve extrair as comorbidades quando vierem dentro de "anamnesis" (Exemplo da Issue)', () => {
    const mockData = {
      patientComments: {
        anamnesis: {
          hypertension: false,
          smoker: true,
          glaucoma: true,
          cataract: false
        }
      }
    } as ExtractedDicomData;

    const result = mapDicomToExamForm(mockData);
    
    expect(result.comorbidades).toBe('Fumante, Glaucoma');
  });

  it('Deve retornar comorbidades como undefined se o JSON vier vazio ou nulo', () => {
    const mockDataNull = { patientComments: null } as ExtractedDicomData;
    const mockDataVazio = { patientComments: {} } as ExtractedDicomData;

    expect(mapDicomToExamForm(mockDataNull).comorbidades).toBeUndefined();
    expect(mapDicomToExamForm(mockDataVazio).comorbidades).toBeUndefined();
  });
});