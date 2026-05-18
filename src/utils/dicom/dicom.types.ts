export interface PatientComments {
  hypertension?: boolean;
  smoker?: boolean;
  glaucoma?: boolean;
  cataract?: boolean;

  anamnesis?: {
    hypertension?: boolean;
    smoker?: boolean;
    glaucoma?: boolean;
    cataract?: boolean;
  };

  diopter?: {
    right?: {
      spherical?: string;
      cylindrical?: string;
      axis?: string;
    };
    left?: {
      spherical?: string;
      cylindrical?: string;
      axis?: string;
    };
  };

  email?: string;
}

export interface ExtractedDicomData {
  patientId: string;
  patientComments: PatientComments | null;
  patientSex: string;
  patientBirthDate: string;
  pupilDilated: string;
  imageLaterality: string;
  manufacturer: string;
  modelName: string;
  serialNumber: string;
  softwareVersions: string;
  instituionName: string;
  seriesDescription: string;
  seriesDate: string;
  seriesTime: string;
  seriesNumber: string;
  modality: string;
  studyId: string;
}
