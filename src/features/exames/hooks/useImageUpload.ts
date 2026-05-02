import { useState } from 'react';

export function useImageUpload(onImageChange: (file: File | null) => void) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return {
    preview,
    handleFileChange,
    removeImage
  };
}