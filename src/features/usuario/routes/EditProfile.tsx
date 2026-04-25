import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth-client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { toast } from 'sonner';
import { useUpdateProfileImage } from '../hooks/useUpdateProfileImage';
import { formatCpf, formatCrm } from '@/utils/formatters';
import { formatDateInput, formatDateLabel } from '@/utils/date';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Camera, Eye, EyeOff } from 'lucide-react';

type EditProfileProps = {
  onClose?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const EditProfile = ({ onClose, onDirtyChange }: EditProfileProps) => {
  const { data: session, refetch } = useSession();
  const { mutate, isPending } = useUpdateProfile();
  const { mutateAsync: uploadImage } = useUpdateProfileImage();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [preview, setPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [novoCrm, setNovoCrm] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentEmail = session?.user.email ?? '';
  const currentBirthDate = useMemo(
    () => formatDateInput(session?.user.dtNascimento),
    [session?.user.dtNascimento]
  );

  const birthDateLabel = useMemo(
    () => formatDateLabel(session?.user.dtNascimento),
    [session?.user.dtNascimento]
  );

  useEffect(() => {
    console.log('API:', session?.user.dtNascimento);
    setDataNascimento(formatDateInput(session?.user.dtNascimento));
  }, [session]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const isDirty =
    Boolean(nomeCompleto.trim()) ||
    Boolean(email.trim()) ||
    Boolean(dataNascimento) ||
    Boolean(senhaAtual.trim()) ||
    Boolean(novaSenha.trim()) ||
    Boolean(selectedFile);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const payload: Record<string, string> = {};

    if (nomeCompleto.trim()) {
      payload.nomeCompleto = nomeCompleto.trim();
    }

    if (email.trim() && email.trim() !== currentEmail) {
      payload.email = email.trim();
    }

    if (dataNascimento && dataNascimento !== currentBirthDate) {
      payload.dtNascimento = dataNascimento;
    }

    if (senhaAtual.trim()) {
      payload.senhaAtual = senhaAtual.trim();
    }

    if (novaSenha.trim()) {
      payload.novaSenha = novaSenha.trim();
    }

    if (novoCrm.trim()) {
      payload.crm = novoCrm.trim();
    }

    if (novoCpf.trim()) {
      payload.cpf = novoCpf.trim();
    }

    if (Object.keys(payload).length === 0 && !selectedFile) {
      toast.error('Nenhuma alteração para salvar.');
      return;
    }

    try {
      if (Object.keys(payload).length > 0) {
        await new Promise<void>((resolve, reject) => {
          mutate(payload, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        });
      }

      if (selectedFile) {
        await uploadImage(selectedFile);
      }

      try {
        await refetch();
      } catch (refetchError) {
        console.error('Erro ao refetch da sessão:', refetchError);
      }

      toast.success('Perfil atualizado!');

      setNomeCompleto('');
      setEmail('');
      setDataNascimento('');
      setSenhaAtual('');
      setNovaSenha('');
      setSelectedFile(null);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setPreview('');
      onClose?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const messages = error.message?.split('\n').filter(Boolean) || [
        'Erro desconhecido',
      ];

      console.log(error.response?.data || error);

      toast.error('Erro ao atualizar perfil', {
        description: (
          <ul className="mt-2 list-disc pl-4 text-sm">
            {messages.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ),
      });
    }
  };

  const userImage = session?.user.image ?? '';

  const imageUrl = useMemo(() => {
    if (!userImage) return '';

    if (import.meta.env.DEV) {
      return userImage.replace(/https?:\/\/[^/]+/, 'http://localhost:9000');
    }

    return userImage;
  }, [userImage]);

  const isSolicitacaoValida = Boolean(novoCrm.trim()) || Boolean(novoCpf.trim());

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-5">
        <div className="space-y-2 text-center">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

            <DialogTrigger asChild>
              <label className="text-blue-500 text-sm font-semibold underline cursor-pointer">
                Para a alteração de CRM ou CPF, solicite ao administrador
              </label>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-center">
                  Solicitar alteração
                </DialogTitle>
                <div className="border-t my-4" />
                <DialogDescription className=" text-sm text-foreground">
                  Informe quais dados deseja alterar. Sua solicitação será
                  enviada ao administrador para análise.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-bold text-foreground">
                  Novo CRM:{' '}
                </label>
                <Input
                  type="text"
                  value={novoCrm}
                  onChange={(e) => setNovoCrm(formatCrm(e.target.value))}
                  placeholder="Ex: 123456/UF"
                />
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-bold text-foreground">
                  Novo CPF:{' '}
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 123.456.789-00"
                  value={novoCpf}
                  onChange={(e) => {
                    setNovoCpf(formatCpf(e.target.value));
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.novoCpf;
                      return next;
                    });
                  }} 
                />
                {fieldErrors.novoCpf && (
                  <span className="text-xs text-red-500">{fieldErrors.novoCpf}</span>
                )}
              </div>
              <DialogFooter>
                <Button
                  disabled={isPending || !isSolicitacaoValida}
                  onClick={() => {
                    toast.success('Solicitação enviada!');
                    setIsModalOpen(false);
                  }}
                >
                  Enviar Solicitação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-2 mb-2 flex flex-col items-center justify-center">
          <div className="group relative">
            <Avatar className="h-28 w-28 border bg-muted shadow-sm">
              <AvatarImage
                src={preview || imageUrl}
                className="object-cover"
                crossOrigin="anonymous"
              />
              <AvatarFallback className="text-4xl text-muted-foreground font-medium">
                {session?.user.name?.substring(0, 2).toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-all duration-200 group-hover:opacity-100"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectImage}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Nome Completo</label>
            <Input
              type="text"
              placeholder={session?.user.name || 'Ana Costa Neves'}
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Email</label>
            <Input
              type="email"
              placeholder={currentEmail || 'anacosta@retina'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Data de nascimento</label>

            <Input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />

            <p className="text-xs text-muted-foreground">
              Data atual: {birthDateLabel}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Senha</label>
            <div className="relative">
              <Input
                type={mostrarSenha ? 'text' : 'password'}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="••••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarSenha ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">
              Confirmação de Senha
            </label>
            <div className="relative">
              <Input
                type={mostrarConfirmacao ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarConfirmacao ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3 pt-2 border-t border-transparent">
          <Button
            variant="secondary"
            onClick={onClose}
            className="bg-gray-200/80 hover:bg-gray-300 text-black"
          >
            Cancelar
          </Button>

          <Button
            disabled={isPending || !isDirty}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
