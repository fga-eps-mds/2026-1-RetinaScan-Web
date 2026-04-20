import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth-client';
import React, { useRef, useState } from 'react';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { useUpdateProfileImage } from '../hooks/useUpdateProfileImage';

const EditProfile = () => {
  const { data: session, refetch } = useSession();
  const { mutate, isPending } = useUpdateProfile();
  const { mutateAsync: uploadImage } = useUpdateProfileImage();
  const originalDate = session?.user.dtNascimento
    ? new Date(session.user.dtNascimento).toISOString().split('T')[0]
    : '';

  const [nomeCompleto, setNomeCompleto] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [dataNascimento, setDataNascimento] = useState<string>(originalDate);
  const [senhaAtual, setSenhaAtual] = useState<string>('');
  const [novaSenha, setNovaSenha] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleSubmit = async () => {
    const payload: Record<string, string> = {};

    if (nomeCompleto) payload.nomeCompleto = nomeCompleto;
    if (email) payload.email = email;
    if (dataNascimento && dataNascimento !== originalDate) {
      payload.dataNascimento = dataNascimento;
    }
    if (senhaAtual) payload.senhaAtual = senhaAtual;
    if (novaSenha) payload.novaSenha = novaSenha;

    try {
      if (Object.keys(payload).length > 0) {
        await new Promise<void>((resolve, reject) => {
          mutate(payload, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
        });
      }

      if (selectedFile) {
        await uploadImage(selectedFile);
      }

      toast.success('Perfil atualizado com sucesso!');

      setSenhaAtual('');
      setNovaSenha('');
      setNomeCompleto('');
      setEmail('');
      setDataNascimento('');
      setSelectedFile(null);

      await refetch();
    } catch (error) {
      const err = error as Error;

      const messages = err.message.split('\n').filter(Boolean);

      toast.error('Erro ao atualizar perfil', {
        description: (
          <ul className="mt-2 list-disc pl-4 space-y-1 text-sm">
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ),
      });
    }
  };

  const imageUrl = session?.user.image?.replace(
    'http://retina-scan-minio:9000',
    'http://localhost:9000'
  );

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <header className="text-center mb-5">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Dados da Conta
        </h2>
      </header>

      <div className="flex flex-col gap-5">
        <Card className="flex flex-col items-center gap-6 p-6 md:flex-row md:items-center md:justify-center">
          <div className="group relative">
            <Avatar className="h-40 w-40 border-2 border-border">
              <AvatarImage
                src={preview || imageUrl || ''}
                className="object-cover"
              />

              <AvatarFallback className="text-5xl">
                {session?.user.name
                  ? session.user.name.substring(0, 2).toUpperCase()
                  : 'US'}
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

          <div className="grid w-full max-w-sm gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">CRM</label>

              <Input type="text" value={session?.user.crm ?? ''} disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">CPF</label>

              <Input type="text" value={session?.user.cpf ?? ''} disabled />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <label className="text-sm font-bold text-foreground">
              Nome Completo
            </label>
            <Input
              onChange={(e) => setNomeCompleto(e.target.value)}
              type="text"
              placeholder={session?.user.name}
            />
          </Card>

          <Card className="p-4">
            <label className="text-sm font-bold text-foreground">Email</label>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder={session?.user.email}
            />
          </Card>

          <Card className="p-4">
            <label className="text-sm font-bold text-foreground">
              Data de Nascimento
            </label>

            <Input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              defaultValue={
                session?.user.dtNascimento
                  ? new Date(session.user.dtNascimento)
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
            />
          </Card>

          <Card className="p-4 ">
            <label className="text-sm font-bold text-foreground">
              Senha Atual
            </label>
            <Input
              onChange={(e) => setSenhaAtual(e.target.value)}
              type="password"
              placeholder="••••••••"
            />

            <label className="text-sm font-bold text-foreground">
              Nova Senha
            </label>
            <Input
              onChange={(e) => setNovaSenha(e.target.value)}
              type="password"
              placeholder="••••••••"
            />
          </Card>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            disabled={
              isPending ||
              (!nomeCompleto &&
                !email &&
                !dataNascimento &&
                !senhaAtual &&
                !novaSenha &&
                !selectedFile)
            }
            onClick={handleSubmit}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
