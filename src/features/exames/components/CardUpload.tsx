import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, ImageIcon, X } from 'lucide-react';

interface ImageUploadBoxProps {
  label: string;
  side: 'OE' | 'OD';
  onImageChange: (file: File | null) => void;
}

export function ImageUploadBox({ label, onImageChange }: ImageUploadBoxProps) {
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

  return (
    <Card className="relative flex flex-col items-center justify-center border-2 border-dashed p-6 transition-colors hover:border-primary/50">
      <div className="mb-4 flex items-center gap-2 self-start font-semibold text-sm">
        <Upload className="h-6 w-6" />
        {label}
      </div>

      <div className="relative flex min-h-[350px] w-full flex-col items-center justify-center rounded-lg bg-muted/30">
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full max-h-[240px] rounded-md object-contain" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center">
            <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="mb-2 text-sm text-muted-foreground">Enviar ou arrastar imagem</p>
            <label>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <span className="cursor-pointer rounded-md border px-4 py-2 text-xs font-medium shadow-sm hover:bg-accent">
                Selecione imagem
              </span>
            </label>
          </div>
        )}
      </div>
    </Card>
  );
}