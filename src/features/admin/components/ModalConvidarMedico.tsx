import { useState } from 'react';
import { Loader2, Mail, Send } from 'lucide-react';
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

export default function ModalConvidarMedico() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  // Limpa o formulário e fecha o modal apenas após sucesso na mutação
  const { mutate, isPending } = useEnviarConvite(() => {
    setIsOpen(false);
    setEmail('');
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Estrutura de lote exigida pela API /api/inscricoes/convites
    mutate({
      convites: [{
        email: email.trim(),
        nome: "Médico Convidado", // Valor padrão conforme regra de negócio atual
        tipoPerfil: 'MEDICO',
      }]
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 font-medium shadow-sm">
          <Mail className="h-4 w-4" />
          Convidar Médico
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar convite de cadastro</DialogTitle>
          <DialogDescription>
            Enviaremos um e-mail com um link seguro para o médico preencher seus
            dados. O link expira em 7 dias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do médico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@medico.com"
              required
              disabled={isPending}
            />
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
            {/* O estado disabled evita submissões múltiplas durante o loading */}
            <Button type="submit" disabled={isPending || !email}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar convite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}