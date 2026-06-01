import { Button } from '@/components/ui/button';
import { CardUpload } from '@/features/criacao-exames/components/CardUpload';
import { Loader2 } from 'lucide-react';

interface UploadStepProps {
  canProceed: boolean;
  isUploading: boolean; 
  onImageChange: (file: File | null, lateralidade: 'OD' | 'OE') => void;
  onNext: () => void;
}

export function UploadStep({ canProceed, isUploading, onImageChange, onNext }: UploadStepProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col sm:flex-row w-full justify-center gap-6">
        <CardUpload 
          label="Olho Direito (OD)" 
          side="OD" 
          onImageChange={(file) => onImageChange(file, 'OD')} 
        />
        <CardUpload 
          label="Olho Esquerdo (OE)" 
          side="OE" 
          onImageChange={(file) => onImageChange(file, 'OE')} 
        />
      </div>
      
      <Button
        size="lg"
        disabled={!canProceed || isUploading} 
        onClick={onNext}
        className="mt-4 px-10"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando imagens...
          </>
        ) : (
          'Continuar para Dados'
        )}
      </Button>
    </div>
  );
}