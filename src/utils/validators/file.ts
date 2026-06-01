const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Adicionado o MIME type do DICOM
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/dicom'];

export const isValidFileType = (file: File): boolean => {
  // Checa o MIME type OU a extensão (para navegadores que não reconhecem DICOM nativamente)
  return ALLOWED_MIME_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.dcm');
};

export const isValidFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE_BYTES;
};

export const validateFile = (file: File | null): string | null => {
  if (!file) return "Arquivo não selecionado.";

  if (!isValidFileType(file)) {
    return "Formato inválido. Use apenas .jpg, .jpeg, .png ou .dcm.";
  }

  if (!isValidFileSize(file)) {
    return "O arquivo excede o limite de 10MB.";
  }

  return null;
};