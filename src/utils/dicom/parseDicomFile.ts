import dicomParser from 'dicom-parser';
import type { ExtractedDicomData, PatientComments } from './dicom.types';

export const parseDicomFile = async (
  file: File
): Promise<ExtractedDicomData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);
        const getString = (tag: string) => dataSet.string(tag) || '';

        const patientCommentsRaw = getString('x00104000');
        let patientCommentsJSON: PatientComments | null = null;

        if (patientCommentsRaw) {
          try {
            patientCommentsJSON = JSON.parse(patientCommentsRaw);
          } catch (error) {
            console.warn(
              'O PatientComments não é um JSON válido ou está vazio.',
              error
            );
          }
        }

        const extractedData: ExtractedDicomData = {
          patientId: getString('x00100020'),
          patientComments: patientCommentsJSON,
          patientSex: getString('x00100040'),
          patientBirthDate: getString('x00100030'),
          pupilDilated: getString('x0022000d'),
          imageLaterality: getString('x00200062'),
          manufacturer: getString('x00080070'),
          modelName: getString('x00081090'),
          serialNumber: getString('x00181000'),
          softwareVersions: getString('x00181020'),
          instituionName: getString('x00080080'),
          seriesDescription: getString('x0008103e'),
          seriesDate: getString('x00080021'),
          seriesTime: getString('x00080031'),
          seriesNumber: getString('x00200011'),
          modality: getString('x00080060'),
          studyId: getString('x00200010'),
        };

        if (!extractedData.patientId) {
          throw new Error(
            'Arquivo DICOM inválido: O identificador do paciente (PatientID) está ausente.'
          );
        }

        resolve(extractedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Falha na leitura do arquivo pelo navegador.'));
    };

    reader.readAsArrayBuffer(file);
  });
};
