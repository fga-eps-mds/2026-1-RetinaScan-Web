import { CardDetalhes } from '../components/CardDetalhes';
import { CardResultado } from '../components/CardResultado';
import { CardImagens } from '../components/CardImagens';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { useGetResultadoExame } from '../hooks/useGetResultadoExame';

const ResultadoExame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetResultadoExame(id);

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <p className="text-sm text-muted-foreground">Carregando resultado do exame...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full p-8">
        <p className="text-sm text-destructive">Não foi possível carregar o resultado do exame.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-border pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="text-left">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/exames')}
              className="inline-flex items-center text-foreground transition-colors hover:text-primary"
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

          <Button type="button" variant="outline" className="gap-2 p-4 font-semibold">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </header>

      <div className="space-y-3">
        <CardImagens imagens={data.imagens} />
        <div className="flex gap-6 grid-cols-1 lg:grid-cols-2">
          <CardResultado resultadosIa={data.resultadosIa} />
          <CardDetalhes exame={data.exam} />
        </div>
      </div>
    </div>
  );
};

export default ResultadoExame;
