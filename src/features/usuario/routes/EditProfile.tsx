import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth-client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { useUpdateProfileImage } from '../hooks/useUpdateProfileImage';

type EditProfileProps = {
  onClose?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const formatDateLabel = (dateValue?: Date | string | null) => {
  if (!dateValue) return 'Não informada';

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  return Number.isNaN(date.getTime())
    ? 'Não informada'
    : new Intl.DateTimeFormat('pt-BR').format(date);
};

const formatDateInput = (dateValue?: Date | string | null) => {
  if (!dateValue) return '';

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
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

  return (
    <div className="px-1 py-1 sm:px-2">
      <div className="flex flex-col gap-4">
        <div className="mb-5 flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-center">
          <div className="group relative">
            <Avatar className="h-36 w-36 border-4 border-background shadow-lg">
              <AvatarImage
                src={preview || imageUrl}
                className="object-cover"
                crossOrigin="anonymous"
              />
              <AvatarFallback className="text-5xl">
                {session?.user.name?.substring(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/55 opacity-0 transition-all duration-200 group-hover:opacity-100"
            >
              <Camera className="h-5 w-5 text-white" />
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">CRM</label>
            <p className="rounded-md py-2 text-sm font-semibold text-foreground">
              {session?.user.crm ?? '-'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">CPF</label>
            <p className="rounded-md py-2 text-sm font-semibold text-foreground">
              {session?.user.cpf ?? '-'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Nome Completo</label>
          <Input
            type="text"
            placeholder={session?.user.name || 'Digite seu nome completo'}
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">E-mail</label>
          <Input
            type="email"
            placeholder={currentEmail || 'Digite seu e-mail'}
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Senha atual</label>
            <Input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Nova senha</label>
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Crie uma nova senha"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button disabled={isPending || !isDirty} onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
