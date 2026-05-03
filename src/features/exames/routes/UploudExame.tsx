import { useState } from 'react';
import { useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { ImageUploadBox } from '../components/CardUpload';
import { toast } from 'sonner';
import { isValidExamId } from '@/utils/validators/exam';

const UploadExame = () => {
  const { id } = useParams();
  const [imageOE, setImageOE] = useState<File | null>(null);
  const [imageOD, setImageOD] = useState<File | null>(null);

  const hasValidExam = isValidExamId(id);

  const hasImages = !!imageOE || !!imageOD;

  const canSubmit = hasValidExam && hasImages;

  const handleUpload = async () => {
    if (!canSubmit) {
      toast.error('Vínculo com exame ausente ou imagens inválidas.');
      return;
    }

    toast.success('Imagens enviadas para processamento!');
  };

  return (
    <div className="w-full flex justify-center flex-col gap-2 p-8">
      <header className="text-center">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Novo Exame
        </h2>
        <p className="text-md text-muted-foreground">
          Faça o upload das imagens para análise com inteligência artificial
        </p>
      </header>

      <div className="flex items-center justify-center gap-16 border-t border-border/100 mt-8 pt-8">
        <ImageUploadBox
          label="Olho esquerdo (OE)"
          side="OE"
          onImageChange={setImageOE}
        />
        <ImageUploadBox
          label="Olho direito (OD)"
          side="OD"
          onImageChange={setImageOD}
        />
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <p className="text-xs text-muted-foreground">
          Aceitos: JPG, JPEG, PNG (Max 10MB)
        </p>

        {!hasValidExam && (
          <p className="text-xs text-destructive font-bold">
            Erro: Sessão de exame inválida ou ID não encontrado.
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground/80">
          Envie pelo menos uma imagem. Casos monoculares podem ter apenas um
          olho.
        </p>

        <Button
          onClick={handleUpload}
          disabled={!canSubmit}
          className={`mt-4 px-12 py-6 text-lg font-bold transition-all ${
            canSubmit
              ? 'bg-[#00b34d] hover:bg-[#009940] opacity-100'
              : 'bg-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          Enviar para Análise
        </Button>
      </div>
    </div>
  );
};

export default UploadExame;
