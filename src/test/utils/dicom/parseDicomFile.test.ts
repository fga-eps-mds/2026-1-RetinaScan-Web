/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseDicomFile } from '@/utils/dicom/parseDicomFile';
import dicomParser from 'dicom-parser';

vi.mock('dicom-parser', () => ({
  default: {
    parseDicom: vi.fn(),
  },
}));

describe('Utilitário DICOM - parseDicomFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Deve extrair os metadados corretamente de um arquivo válido', async () => {
    const mockDataSet = {
      string: vi.fn((tag: string) => {
        if (tag === 'x00100020') return 'phelcom_123';
        if (tag === 'x00104000') return '{"hypertension": true}';
        if (tag === 'x00100040') return 'M';
        return '';
      }),
    };
    (dicomParser.parseDicom as any).mockReturnValue(mockDataSet);

    const fakeFile = new File([''], 'exame.dcm', { type: 'application/dicom' });
    
    const result = await parseDicomFile(fakeFile);

    expect(result.patientId).toBe('phelcom_123');
    expect(result.patientComments).toEqual({ hypertension: true });
    expect(result.patientSex).toBe('M');
  });

  it('Deve lançar erro se o PatientID não for encontrado', async () => {
    const mockDataSet = {
      string: vi.fn((tag: string) => {
        if (tag === 'x00100020') return undefined;
        return 'dados_genericos';
      }),
    };
    (dicomParser.parseDicom as any).mockReturnValue(mockDataSet);

    const fakeFile = new File([''], 'exame_sem_id.dcm');

    await expect(parseDicomFile(fakeFile)).rejects.toThrow(
      'Arquivo DICOM inválido: O identificador do paciente (PatientID) está ausente.'
    );
  });

  it('Deve ignorar o erro de JSON se o PatientComments vier corrompido, e retornar null', async () => {
    const mockSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mockDataSet = {
      string: vi.fn((tag: string) => {
        if (tag === 'x00100020') return 'phelcom_123';
        if (tag === 'x00104000') return '{ json_invalido: sem_aspas }';
        return '';
      }),
    };
    (dicomParser.parseDicom as any).mockReturnValue(mockDataSet);

    const fakeFile = new File([''], 'exame_corrompido.dcm');
    const result = await parseDicomFile(fakeFile);

    expect(result.patientComments).toBeNull();
    expect(mockSpy).toHaveBeenCalledWith(
      'O PatientComments não é um JSON válido ou está vazio.',
      expect.any(Error)
    );

    mockSpy.mockRestore();
  });
});