import { Button } from '@/components/ui/button';
import { CardUpload } from '@/features/criacao-exames/components/CardUpload';

interface UploadStepProps {
  canProceed: boolean;
  onImageChange: (file: File | null, lateralidade: 'OD' | 'OE') => void;
  onNext: () => void;
}

export function UploadStep({ canProceed, onImageChange, onNext }: UploadStepProps) {
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
        disabled={!canProceed}
        onClick={onNext}
        className="mt-4 px-10"
      >
        Continuar para Dados
      </Button>
    </div>
  );
}