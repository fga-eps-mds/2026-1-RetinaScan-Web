import { useState } from 'react';
import { useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { ImageUploadBox } from '../components/CardUpload';
import { toast } from 'sonner';

const UploadExame = () => {
  const { id } = useParams();
  const [imageOE, setImageOE] = useState<File | null>(null);
  const [imageOD, setImageOD] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!imageOE && !imageOD) {
      toast.error("Selecione pelo menos uma imagem para análise.");
      return;
    }
     // console inicial para teste, precisa integrar com a api
    console.log("Enviando para o exame:", id, { imageOE, imageOD });
    toast.success("Imagens enviadas para processamento!");
  };

  return (
    <div className="w-full flex  justify-center flex-col gap-2 p-8">
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
          Aceitos: JPG, PNG, TIFF (Max 10MB)
        </p>
        <p className=" text-center text-xs text-muted-foreground/80">
          Envie pelo menos uma imagem. Casos monoculares podem ter apenas um olho.
        </p>
        
        <Button 
          onClick={handleUpload}
          className="mt-4 bg-[#00b34d] px-12 py-6 text-lg font-bold hover:bg-[#009940]"
        >
          Enviar para Análise
        </Button>
      </div>
    </div>
  );
};

export default UploadExame;