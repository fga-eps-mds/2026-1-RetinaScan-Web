import { CardDetalhes } from '../components/CardDetalhes';
import { CardResultado } from '../components/CardResultado';
import { CardImagens } from '../components/CardImagens';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon, Share2 } from 'lucide-react';

const ResultadoExame = () => {
  return (
    <div className="w-full p-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-border pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="text-left">
          <h2 className="text-4xl font-heading font-bold text-foreground sm:text-lg">
            <ArrowLeft className="mr-2 inline-block h-5 w-5 align-middle" />
            Exame RA-001
          </h2>
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
        <CardImagens />
        <div className="flex gap-6 grid-cols-1 lg:grid-cols-2">
          <CardResultado />
          <CardDetalhes />
        </div>
      </div>
    </div>
  );
};

export default ResultadoExame;
