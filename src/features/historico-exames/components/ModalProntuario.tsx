import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModalProntuarioProps {
  isOpen: boolean;
  onClose: () => void;
  prontuario?: string | null;
  paciente?: string;
}

export function ModalProntuario({
  isOpen,
  onClose,
  prontuario,
  paciente,
}: ModalProntuarioProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[92vw] lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Prontuário do exame
          </DialogTitle>

          {paciente ? <p className="text-xl font-bold">{paciente}</p> : null}
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {prontuario?.trim() ? (
            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {prontuario}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum prontuário informado para este exame.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
