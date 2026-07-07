import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScanEye, ImageOff, Flame, Eye } from 'lucide-react';
import type {
  ExamGradCam,
  ExamResultImage,
  LateralidadeOlho,
} from '../types/exam-result';
import { VisualizadorZoomPan } from './VisualizadorZoomPan';

type CardImagensProps = {
  imagens?: ExamResultImage[];
  gradCam?: ExamGradCam[] | null;
};

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-4/2 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 text-muted-foreground">
      <ImageOff className="h-5 w-5" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

type EyeImageSectionProps = {
  title: string;
  image?: ExamResultImage;
  gradCamImage?: ExamGradCam;
  isShowingGradCam: boolean;
  onToggleGradCam: () => void;
  unavailableLabel: string;
};

function EyeImageSection({
  title,
  image,
  gradCamImage,
  isShowingGradCam,
  onToggleGradCam,
  unavailableLabel,
}: EyeImageSectionProps) {
  const displayedUrl =
    isShowingGradCam && gradCamImage ? gradCamImage.url : image?.url;

  if (!image?.url) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ScanEye className="h-4 w-4" />
            <span>{title}</span>
          </div>
        </div>

        <ImagePlaceholder label={unavailableLabel} />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ScanEye className="h-4 w-4" />
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {gradCamImage && (
            <Button
              type="button"
              size="sm"
              variant={isShowingGradCam ? 'default' : 'outline'}
              className="gap-2"
              onClick={onToggleGradCam}
            >
              {isShowingGradCam ? (
                <>
                  <Eye className="h-4 w-4" />
                  Ver original
                </>
              ) : (
                <>
                  <Flame className="h-4 w-4" />
                  Ver Grad-CAM
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-3 z-10">
          <Badge variant="secondary">
            {isShowingGradCam ? 'Grad-CAM' : 'Original'}
          </Badge>
        </div>

        <VisualizadorZoomPan imageUrl={displayedUrl ?? ''} />
      </div>

      {!gradCamImage && (
        <p className="text-xs text-muted-foreground">
          Grad-CAM indisponível para este olho.
        </p>
      )}
    </section>
  );
}

export function CardImagens({ imagens, gradCam = null }: CardImagensProps) {
  const [showGradCamByEye, setShowGradCamByEye] = useState<
    Partial<Record<LateralidadeOlho, boolean>>
  >({});

  const od = imagens?.find((img) => img.lateralidadeOlho === 'OD');
  const oe = imagens?.find((img) => img.lateralidadeOlho === 'OE');

  const gradCamByEye = useMemo(() => {
    return (gradCam ?? []).reduce<
      Partial<Record<LateralidadeOlho, ExamGradCam>>
    >((acc, item) => {
      acc[item.lateralidadeOlho] = item;
      return acc;
    }, {});
  }, [gradCam]);

  const odGradCam = gradCamByEye.OD;
  const oeGradCam = gradCamByEye.OE;

  return (
    <Card className="w-full max-w-full border border-border/70 p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2 border-b border-border pb-4 text-lg font-semibold text-foreground">
        <span>Imagens da Retinografia</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <EyeImageSection
          title="Olho direito (OD)"
          image={od}
          gradCamImage={odGradCam}
          isShowingGradCam={Boolean(showGradCamByEye.OD)}
          onToggleGradCam={() =>
            setShowGradCamByEye((prev) => ({
              ...prev,
              OD: !prev.OD,
            }))
          }
          unavailableLabel="Imagem do olho direito indisponível"
        />

        <EyeImageSection
          title="Olho esquerdo (OE)"
          image={oe}
          gradCamImage={oeGradCam}
          isShowingGradCam={Boolean(showGradCamByEye.OE)}
          onToggleGradCam={() =>
            setShowGradCamByEye((prev) => ({
              ...prev,
              OE: !prev.OE,
            }))
          }
          unavailableLabel="Imagem do olho esquerdo indisponível"
        />
      </div>
    </Card>
  );
}
