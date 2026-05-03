import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateExam } from '../hooks/useCreateExam';
import { parseApiError } from '../api/parseApiError';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router';
import type { SexoExame } from '../types/exam';

const formatCpf = (value: string): string => {
  const digits = value.replaceAll(/\D/g, '').slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const NovoExame = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<SexoExame | ''>('');
  const [cpf, setCpf] = useState('');
  const [comorbidades, setComorbidades] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const createExamMutation = useCreateExam();

  const resetForm = () => {
    setNomeCompleto('');
    setDataNascimento('');
    setSexo('');
    setCpf('');
    setComorbidades('');
    setDescricao('');
    setError(null);
    setFieldErrors({});
  };

  const handleCreateExam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setFieldErrors({});

    try {
      await createExamMutation.mutateAsync({
        nomeCompleto,
        cpf: cpf.replaceAll(/\D/g, ''),
        sexo: sexo as SexoExame,
        dtNascimento: dataNascimento,
        dtHora: new Date().toISOString(),
        comorbidades: comorbidades.trim() ? comorbidades : undefined,
        descricao: descricao.trim() ? descricao : undefined,
      });

      toast.success('Exame criado com sucesso.');
      resetForm();
      navigate('/exames');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const { message, fieldErrors } = parseApiError(err?.response?.data);

      setError(message);
      setFieldErrors(fieldErrors);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <form
        className="mx-auto flex w-full max-w-6xl flex-col gap-6"
        onSubmit={handleCreateExam}
      >
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
            <label htmlFor="nomeCompleto" className="text-sm font-bold">
              Nome do Paciente
            </label>
            <Input
              id="nomeCompleto"
              onChange={(e) => {
                setNomeCompleto(e.target.value);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.nomeCompleto;
                  return next;
                });
              }}
              placeholder="Digite o nome completo do paciente"
              value={nomeCompleto}
              required
            />
            {fieldErrors.nomeCompleto && (
              <p className="text-xs text-destructive">{fieldErrors.nomeCompleto}</p>
            )}
          </Card>

          <Card className="p-4">
            <label htmlFor="dtNascimento" className="text-sm font-semibold">
              Data de nascimento
            </label>
            <Input
              id="dtNascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => {
                setDataNascimento(e.target.value);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.dtNascimento;
                  return next;
                });
              }}
              className={
                dataNascimento ? 'text-foreground' : 'text-muted-foreground'
              }
              required
            />
            {fieldErrors.dtNascimento && (
              <p className="text-xs text-destructive">{fieldErrors.dtNascimento}</p>
            )}
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-4">
            <label htmlFor="sexo" className="text-sm font-semibold">
              Sexo
            </label>
            <select
              id="sexo"
              value={sexo}
              onChange={(e) => {
                setSexo(e.target.value as SexoExame);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.sexo;
                  return next;
                });
              }}
              className={`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${sexo ? 'text-foreground' : 'text-muted-foreground'}`}
              required
            >
              <option value="" disabled>
                Selecione o sexo
              </option>
              <option value="FEMININO">Feminino</option>
              <option value="MASCULINO">Masculino</option>
              <option value="OUTRO">Outro</option>
            </select>
            {fieldErrors.sexo && (
              <p className="text-xs text-destructive">{fieldErrors.sexo}</p>
            )}
          </Card>

          <Card className="p-4">
            <label htmlFor="cpf" className="text-sm font-semibold">
              CPF
            </label>
            <Input
              id="cpf"
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
          <label htmlFor="comorbidades" className="text-sm font-semibold">
            Comorbidades
          </label>
          <textarea
            id="comorbidades"
            className="w-full min-h-32 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Descreva as comorbidades do paciente, se houver"
            rows={4}
            value={comorbidades}
            onChange={(e) => {
              setComorbidades(e.target.value);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.comorbidades;
                return next;
              });
            }}
          />
          {fieldErrors.comorbidades && (
            <p className="text-xs text-destructive">{fieldErrors.comorbidades}</p>
          )}
        </Card>
        <Card className="p-4">
          <label htmlFor="descricao" className="text-sm font-semibold">
            Descrição
          </label>
          <textarea
            id="descricao"
            className="w-full min-h-32 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Dê uma descrição sobre o motivo do exame"
            rows={4}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.descricao;
                return next;
              });
            }}
            required
          />
          {fieldErrors.descricao && (
            <p className="text-xs text-destructive">{fieldErrors.descricao}</p>
          )}
        </Card>

        {error && <p className="text-xs text-destructive">{error}</p>}


        <Button
          type="submit"
          size="sm"
          disabled={createExamMutation.isPending}
          className="self-center border-0 px-10 py-4 text-primary-foreground font-semibold hover:opacity-90"
        >
          {createExamMutation.isPending ? 'Salvando...' : 'Continuar'}
        </Button>
        <Button
            variant="ghost"
            asChild
            size="sm"
            className="self-center text-muted-foreground underline"
          >
            <Link to="/exames/upload"> 
              Ir para Upload (Teste)
            </Link>
          </Button>
      </form>
    </div>
  );
};

export default NovoExame;
