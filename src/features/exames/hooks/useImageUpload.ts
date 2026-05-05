import { useState } from 'react';
import { toast } from 'sonner'
import { validateFile } from '@/utils/validators/file';

export function useImageUpload(onImageChange: (file: File | null) => void) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (file: File) => {

    const errorMessage = validateFile(file);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return {
    preview,
    handleFileChange,
    handleDrop,
    removeImage
  };
  
}