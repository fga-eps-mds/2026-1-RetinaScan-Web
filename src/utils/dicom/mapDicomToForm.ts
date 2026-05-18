import type {
  CreateExamDTO,
  SexoExame,
} from '@/features/criacao-exames/types/exam';
import type { ExtractedDicomData, PatientComments } from './dicom.types';

const mapDicomSex = (dicomSex: string): SexoExame => {
  if (!dicomSex) return 'OUTRO';
  
  const upperSex = dicomSex.toUpperCase();
  if (upperSex == 'M') return 'MASCULINO';
  if (upperSex == 'F') return 'FEMININO';
  return 'OUTRO';
};

const formatBirthDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return '';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  return `${day}-${month}-${year}`;
};

const formatSeriesDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return '';
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

const formatDicomTime = (timeStr: string): string => {
  if (!timeStr || timeStr.length < 6) return '';
  return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
};

const formatarComorbidades = (
  comments: PatientComments | null
): string | undefined => {
  if (!comments) return undefined;

  const dataToRead = comments.anamnesis ? comments.anamnesis : comments;

  const comorbidades: string[] = [];

  if (dataToRead.hypertension) comorbidades.push('Hipertensão');
  if (dataToRead.smoker) comorbidades.push('Fumante');
  if (dataToRead.glaucoma) comorbidades.push('Glaucoma');
  if (dataToRead.cataract) comorbidades.push('Catarata');

  return comorbidades.length > 0 ? comorbidades.join(', ') : undefined;
};

export const mapDicomToExamForm = (
  dicomData: ExtractedDicomData
): Partial<CreateExamDTO> => {
  const dataFormatada = formatSeriesDate(dicomData.seriesDate);
  const horaFormatada = formatDicomTime(dicomData.seriesTime);
  const dtHora =
    dataFormatada && horaFormatada ? `${dataFormatada}T${horaFormatada}` : '';

  return {
    sexo: mapDicomSex(dicomData.patientSex),
    dtNascimento: formatBirthDate(dicomData.patientBirthDate),
    dtHora: dtHora,
    comorbidades: formatarComorbidades(dicomData.patientComments),
  };
};
