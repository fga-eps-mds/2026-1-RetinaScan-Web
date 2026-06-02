import { useState } from 'react';
import { toast } from 'sonner';
import { validateFile } from '@/utils/validators/file';

type UploadedImage = { file: File; lateralidade: 'OD' | 'OE'; preview: string; };

export const useExamUpload = () => {
  const [imagens, setImagens] = useState<UploadedImage[]>([]);

  const handleImageChange = (file: File | null, lateralidade: 'OD' | 'OE') => {
    if (!file) {
      setImagens((prev) => prev.filter((img) => img.lateralidade !== lateralidade));
      return;
    }

    const fileError = validateFile(file);
    if (fileError) {
      toast.error(fileError);
      return; 
    }

    const preview = URL.createObjectURL(file);
    setImagens((prev) => {
      const filtered = prev.filter((img) => img.lateralidade !== lateralidade);
      return [...filtered, { file, lateralidade, preview }];
    });
  };

  return { imagens, setImagens, handleImageChange };
};