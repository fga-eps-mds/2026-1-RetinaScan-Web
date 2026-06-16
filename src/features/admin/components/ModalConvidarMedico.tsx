import { useRef, useState } from 'react';
import { FileSpreadsheet, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEnviarConvite } from '../hooks/useEnviarConvite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { parseArquivo } from '@/utils/files/parseArquivo';

export default function ModalConvidarMedico() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync, isPending } = useEnviarConvite();

  const limparArquivo = () => {
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    try {
      const convites = await parseArquivo(file);

      if (!convites.length) {
        throw new Error('Nenhuma linha válida encontrada no arquivo.');
      }

      await mutateAsync({ convites });

      setIsOpen(false);
      limparArquivo();
    } catch (error) {
      toast.error('Erro ao processar/enviar arquivo.', {
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao processar o arquivo.',
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (!open) {
          limparArquivo();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 font-medium shadow-sm">
          <FileSpreadsheet className="h-4 w-4" />
          Enviar convites
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar convites</DialogTitle>
          <DialogDescription>
            Envie um arquivo Excel ou CSV com as colunas Nome, Email e Tipo de
            Perfil.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="arquivo-convites">Arquivo</Label>
            <Input
              ref={inputRef}
              id="arquivo-convites"
              type="file"
              accept=".xlsx,.xls,.csv"
              disabled={isPending}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] ?? null;
                setFile(selectedFile);
              }}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Formatos aceitos: .xlsx, .xls e .csv
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isPending || !file}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar convites
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
