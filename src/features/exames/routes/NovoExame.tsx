import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const NovoExame = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [cpf, setCpf] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="text-center">
          <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
            Novo Exame
          </h2>

          <p className="text-md text-muted-foreground">
            Preencha os dados do paciente abaixo.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-4">
            <label className="text-sm font-bold">Nome do Paciente</label>
            <Input
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Digite o nome completo do paciente"
              value={nomeCompleto}
              required
            />
          </Card>

          <Card className="p-4">
            <label className="text-sm font-semibold">Data de nascimento</label>
            <Input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className={
                dataNascimento ? 'text-foreground' : 'text-muted-foreground'
              }
              required
            />
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-4">
            <label className="text-sm font-semibold">Sexo</label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className={`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${sexo ? 'text-foreground' : 'text-muted-foreground'}`}
              required
            >
              <option value="" disabled>
                Selecione o sexo
              </option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
            </select>
          </Card>

          <Card className="p-4">
            <label className="text-sm font-semibold">CPF</label>
            <Input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => {
                setCpf(formatCpf(e.target.value));
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.cpf;
                  return next;
                });
              }}
              required
            />
            {fieldErrors.cpf && (
              <p className="text-xs text-destructive">{fieldErrors.cpf}</p>
            )}
          </Card>
        </div>
        <Card className="p-4">
          <label className="text-sm font-semibold">Prontuário</label>
          <textarea
            className="w-full min-h-32 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Digite o prontuário do paciente"
            rows={4}
            required
          />
        </Card>

        <Card className="p-4">
          <label className="text-sm font-semibold">Comorbidades</label>
          <textarea
            className="w-full min-h-32 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Descreva as comorbidades"
            rows={4}
            required
          />
        </Card>

        <Button
          type="submit"
          size="sm"
          className="self-center border-0 px-10 py-4 text-primary-foreground font-semibold hover:opacity-90"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default NovoExame;
