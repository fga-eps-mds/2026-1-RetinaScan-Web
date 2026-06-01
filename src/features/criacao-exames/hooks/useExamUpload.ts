import { useState } from 'react';
import { toast } from 'sonner';
import { validateFile } from '@/utils/validators/file';
import { parseDicomFile } from '@/utils/dicom/parseDicomFile';
import { mapDicomToExamForm } from '@/utils/dicom/mapDicomToForm';

type UploadedImage = { file: File; lateralidade: 'OD' | 'OE'; preview: string; };

export const useExamUpload = (onDicomExtracted: (data: any) => void) => {
  const [imagens, setImagens] = useState<UploadedImage[]>([]);
  const [isDicom, setIsDicom] = useState(false);

  const handleImageChange = async (file: File | null, lateralidade: 'OD' | 'OE') => {
    // Se o usuário cancelou a seleção ou removeu a imagem
    if (!file) {
      setImagens((prev) => prev.filter((img) => img.lateralidade !== lateralidade));
      return;
    }

    // Impede que arquivos pesados ou inválidos travem o navegador
    const fileError = validateFile(file);
    if (fileError) {
      toast.error(fileError);
      return; 
    }

    // Gera um blob URL temporário para exibir a miniatura
    const preview = URL.createObjectURL(file);
    setImagens((prev) => {
      const filtered = prev.filter((img) => img.lateralidade !== lateralidade);
      return [...filtered, { file, lateralidade, preview }];
    });

    // Identificação do tipo de arquivo (DICOM vs. Formatos tradicionais)
    if (file.name.toLowerCase().endsWith('.dcm') || file.type === 'application/dicom') {
      try {
        const dicomData = await parseDicomFile(file);
        const mappedData = mapDicomToExamForm(dicomData);
        
        // Manda os dados extraídos de volta para o hook principal atualizar os forms
        onDicomExtracted(mappedData); 
        
        setIsDicom(true);
        toast.success('Dados extraídos do arquivo DICOM com sucesso! Revise as informações.');
      } catch (err) {
        console.error(err);
        toast.warning('Não foi possível ler os metadados deste DICOM. Você pode preencher os dados manualmente.');
        setIsDicom(false);
      }
    } else {
      setIsDicom(false);
    }
  };

  return { imagens, setImagens, isDicom, handleImageChange };
};