import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanEye } from 'lucide-react';
import retinaExemplo1 from '@/assets/retinaExemplo1.png';
import retinaExemplo2 from '@/assets/retinaExemplo2.png';
import type { ExamResultImage } from '../types/exam-result';

type CardImagensProps = {
  imagens?: ExamResultImage[];
};

const defaultImages: ExamResultImage[] = [
  {
    id: 'mock-od',
    lateralidadeOlho: 'OD',
    qualidadeImg: 'Normal',
    caminhoImg: 'mock-od',
    url: retinaExemplo1,
  },
  {
    id: 'mock-oe',
    lateralidadeOlho: 'OE',
    qualidadeImg: 'Alterado',
    caminhoImg: 'mock-oe',
    url: retinaExemplo2,
  },
];

export function CardImagens({ imagens = defaultImages }: CardImagensProps) {
  const [od, oe] = imagens;

  return (
    <Card className="w-full max-w-full border-0.5 p-8">
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-5 font-semibold text-lg text-foreground">
        <span>Imagens da Retinografia</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-stretch">
        <section className="flex-1 space-y-4 pb-6 md:pb-0 md:pr-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <ScanEye className="h-4 w-4" />
              <span>Olho direito (OD)</span>
            </div>

            <Badge variant={od?.qualidadeImg === 'Alterado' ? 'destructive' : 'affirmative'}>
              {od?.qualidadeImg ?? 'Normal'}
            </Badge>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
            <img
              src={od?.url ?? retinaExemplo1}
              alt="Retinografia do olho direito"
              className="h-64 w-full object-cover md:h-64"
            />
          </div>
        </section>

        <div className="my-3 h-px w-full bg-border md:my-0 md:mx-6 md:h-auto md:w-px" />

        <section className="flex-1 space-y-4 pt-6 md:pt-0 md:pl-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <ScanEye className="h-4 w-4" />
              <span>Olho esquerdo (OE)</span>
            </div>

            <Badge variant={oe?.qualidadeImg === 'Alterado' ? 'destructive' : 'affirmative'}>
              {oe?.qualidadeImg ?? 'Alterado'}
            </Badge>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
            <img
              src={oe?.url ?? retinaExemplo2}
              alt="Retinografia do olho esquerdo"
              className="h-64 w-full object-cover md:h-64"
            />
          </div>
        </section>
      </div>
    </Card>
  );
}
