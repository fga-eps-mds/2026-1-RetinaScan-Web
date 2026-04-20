import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth-client';
import React, { useMemo, useRef, useState } from 'react';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { useUpdateProfileImage } from '../hooks/useUpdateProfileImage';

// Funções auxiliares mantidas fora para não re-renderizar
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
  return date.toISOString().split('T')[0];
};

const EditProfile = () => {
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

  const currentBirthDateLabel = useMemo(
    () => formatDateLabel(session?.user.dtNascimento),
    [session?.user.dtNascimento]
  );

  const originalDate = useMemo(
    () => formatDateInput(session?.user.dtNascimento),
    [session?.user.dtNascimento]
  );

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const payload: Record<string, string> = {};

    if (nomeCompleto.trim()) payload.nomeCompleto = nomeCompleto.trim();
    if (email.trim()) payload.email = email.trim();
    if (dataNascimento && dataNascimento !== originalDate)
      payload.dataNascimento = dataNascimento;
    if (senhaAtual.trim()) payload.senhaAtual = senhaAtual.trim();
    if (novaSenha.trim()) payload.novaSenha = novaSenha.trim();

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

      toast.success('Perfil atualizado!');

      // Limpar campos de senha
      setSenhaAtual('');
      setNovaSenha('');
      setSelectedFile(null);
      setPreview('');

      await refetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const messages = error.message?.split('\n').filter(Boolean) || [
        'Erro desconhecido',
      ];
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

    // Ajuste de rota Docker vs Localhost
    const base = userImage.replace(
      'http://retina-scan-minio:9000',
      'http://localhost:9000'
    );

    // O timestamp evita cache de erro do navegador
    return `${base}?t=${new Date().getTime()}`;
  }, [userImage]);

  const hasChanges =
    !!nomeCompleto.trim() ||
    !!email.trim() ||
    !!dataNascimento ||
    !!senhaAtual.trim() ||
    !!novaSenha.trim() ||
    !!selectedFile;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <header className="text-center mb-5">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Dados da Conta
        </h2>
      </header>

      <div className="flex flex-col gap-5">
        <Card className="flex flex-col items-center gap-6 p-6 md:flex-row md:justify-center">
          <div className="group relative">
            <Avatar className="h-40 w-40 border-2 border-border">
              {/* O segredo está aqui: crossOrigin="anonymous" impede o envio dos cookies gigantes */}
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
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100"
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

          <div className="grid w-full max-w-sm gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">CRM</label>
              <Input value={session?.user.crm ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">CPF</label>
              <Input value={session?.user.cpf ?? ''} disabled />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <label className="text-sm font-bold">Nome Completo</label>
            <Input
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder={session?.user.name ?? ''}
              value={nomeCompleto}
            />
          </Card>

          <Card className="p-4">
            <label className="text-sm font-bold">Email</label>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              placeholder={session?.user.email ?? ''}
              value={email}
            />
          </Card>

          <Card className="p-4">
            <label className="text-sm font-bold">Data de Nascimento</label>
            <Input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Atual: {currentBirthDateLabel}
            </p>
          </Card>

          <Card className="p-4">
            <label className="text-sm font-bold">Alterar Senha</label>
            <Input
              className="mb-2"
              onChange={(e) => setSenhaAtual(e.target.value)}
              type="password"
              placeholder="Senha Atual"
              value={senhaAtual}
            />
            <Input
              onChange={(e) => setNovaSenha(e.target.value)}
              type="password"
              placeholder="Nova Senha"
              value={novaSenha}
            />
          </Card>
        </div>

        <div className="flex justify-center mt-6">
          <Button disabled={isPending || !hasChanges} onClick={handleSubmit}>
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
