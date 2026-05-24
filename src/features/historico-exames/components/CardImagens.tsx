import { Card } from '@/components/ui/card';
import { ScanEye, ImageOff } from 'lucide-react';
import type { ExamResultImage } from '../types/exam-result';

type CardImagensProps = {
  imagens?: ExamResultImage[];
};

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-4/2 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 text-muted-foreground">
      <ImageOff className="h-5 w-5" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function CardImagens({ imagens }: CardImagensProps) {
  const od = imagens?.find((img) => img.lateralidadeOlho === 'OD');
  const oe = imagens?.find((img) => img.lateralidadeOlho === 'OE');

  return (
    <Card className="w-full max-w-full border border-border/70 p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2 border-b border-border pb-4 text-lg font-semibold text-foreground">
        <span>Imagens da Retinografia</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ScanEye className="h-4 w-4" />
              <span>Olho direito (OD)</span>
            </div>
          </div>

          {od?.url ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
              <div className="aspect-4/2 w-full bg-black/5">
                <img
                  src={od.url}
                  alt="Retinografia do olho direito"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <ImagePlaceholder label="Imagem do olho direito indisponível" />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ScanEye className="h-4 w-4" />
              <span>Olho esquerdo (OE)</span>
            </div>
          </div>

          {oe?.url ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
              <div className="aspect-4/2 w-full bg-black/5">
                <img
                  src={oe.url}
                  alt="Retinografia do olho esquerdo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <ImagePlaceholder label="Imagem do olho esquerdo indisponível" />
          )}
        </section>
      </div>
    </Card>
  );
}
