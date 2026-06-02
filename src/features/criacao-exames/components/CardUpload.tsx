import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, ImageIcon, X } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

/**
 * Contrato de propriedades do componente CardUpload.
 * @param label - Rótulo de exibição na UI (ex: "Olho Direito (OD)").
 * @param side - Identificador da lateralidade, útil caso o componente pai precise distinguir as instâncias.
 * @param onImageChange - Callback executado quando um arquivo é selecionado ou removido, passando o File ou null para o pai.
 */
interface CardUploadProps {
  label: string;
  side: 'OE' | 'OD';
  onImageChange: (file: File | null) => void;
}

export function CardUpload({ label, onImageChange }: CardUploadProps) {
  // A lógica pesada de gerenciar o arquivo (File), gerar o base64/URL local para o preview 
  // e tratar os eventos nativos do navegador foi abstraída para o hook useImageUpload.
  // Isso mantém este componente focado estritamente na interface (UI).
  const { preview, handleFileChange, handleDrop, removeImage } = useImageUpload(onImageChange);

  return (
    <Card 
      className="w-full max-w-110 p-8 border-2 border-dashed flex flex-col gap-4"      
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* onDragOver impede o comportamento padrão do navegador de abrir a imagem em uma nova aba */}
      {/* onDrop captura o arquivo solto na área demarcada e passa para o handler do hook */}
      
      <div className="mb-4 flex items-center gap-2 self-start font-semibold text-sm">
        <Upload className="h-4 w-4" />
        {label}
      </div>

      <div className="relative flex min-h-90 w-full flex-col items-center justify-center rounded-lg bg-muted/30">
        
        {/* Renderização Condicional: Se existe um preview (imagem selecionada), mostra a miniatura */}
        {preview ? (
          <>
            <img 
              src={preview} 
              alt={label}
              className="h-full rounded-md object-contain" 
            />
            {/* Botão flutuante para remover a imagem. Ao clicar, o removeImage limpa o 
                preview local e dispara o onImageChange(null) para avisar o componente pai. */}
            <Button
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-white"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          
          <div className="flex flex-col items-center text-center gap-6">
            {/* Fallback: Se não tem preview, mostra o Empty State (ícone e botão de upload) */}
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            <p className="mb-2 text-sm text-muted-foreground">Enviar ou arrastar imagem</p>
            
            {/* O label atua como um wrapper clicável para o input file invisível. */}
            {/* IMPORTANTE: O atributo accept é crucial para permitir que o navegador do usuário 
                consiga selecionar arquivos .dcm, além das extensões normais de imagem. */}
            <label>
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.dcm,application/dicom" 
                onChange={(e) => {
                  // Captura o primeiro arquivo do FileList nativo e manda para o handler
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
              />
              <span className="cursor-pointer rounded-md border px-4 py-2 text-xs font-medium shadow-sm hover:bg-accent transition-colors">
                Selecione imagem
              </span>
            </label>
          </div>
        )}
      </div>
    </Card>
  );
}