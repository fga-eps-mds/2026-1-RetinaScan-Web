import { CardDetalhes } from '../components/CardDetalhes';
import { CardResultado } from '../components/CardResultado';
import { CardImagens } from '../components/CardImagens';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon, LoaderCircle, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { useGetResultadoExame } from '../hooks/useGetResultadoExame';
import { CardComorbidades } from '../components/CardComorbidades';

const ResultadoExame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching } = useGetResultadoExame(id);

  if (isLoading) {
    return (
      <div className="h-screen w-full overflow-y-auto p-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <p>Carregando resultado do exame...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-screen w-full overflow-y-auto p-8">
        <p className="text-sm text-destructive">
          Não foi possível carregar o resultado do exame.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-auto p-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-border pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="text-left">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/exames')}
              className="inline-flex items-center text-foreground transition-colors hover:text-primary cursor-pointer"
              aria-label="Voltar para exames"
            >
              <ArrowLeft className="mr-2 inline-block h-5 w-5 align-middle" />
            </button>

            <h2 className="text-4xl font-heading font-bold text-foreground sm:text-lg">
              Exame {data.exam.id}
            </h2>
          </div>

          <p className="text-md text-muted-foreground">
            Detalhes e resultado do exame
          </p>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Button type="button" className="gap-2 p-4 font-semibold">
            <DownloadIcon className="h-4 w-4" />
            Baixar Laudo
          </Button>

          <Button
            type="button"
            variant="outline"
            className="gap-2 p-4 font-semibold"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </header>

      {isFetching && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>Atualizando dados do exame...</span>
        </div>
      )}

      <div className="space-y-3 pb-6">
        <CardImagens imagens={data.imagens} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="lg:col-span-2">
            <CardResultado payload={data} />
          </div>

          <div className="h-full">
            <CardDetalhes exame={data.exam} />
          </div>

          <div className="h-full">
            <CardComorbidades comorbidades={data.exam.comorbidades} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadoExame;
