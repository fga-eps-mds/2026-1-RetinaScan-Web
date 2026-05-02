import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, ImageIcon, X } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploadBoxProps {
  label: string;
  side: 'OE' | 'OD';
  onImageChange: (file: File | null) => void;
}
export function ImageUploadBox({ label, onImageChange }: ImageUploadBoxProps) {
  const { preview, handleFileChange, handleDrop, removeImage } = useImageUpload(onImageChange);

  return (
    <Card 
      className="w-full max-w-[500px] p-8 border-2 border-dashed flex flex-col gap-4"      
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="mb-4 flex items-center gap-2 self-start font-semibold text-sm">
        <Upload/>
        {label}
      </div>

      <div className="relative flex min-h-[350px] w-full flex-col items-center justify-center rounded-lg bg-muted/30">
        {preview ? (
          <>
            <img 
             src={preview}
             className="h-full rounded-md object-contain" />
            <Button
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-6">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
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