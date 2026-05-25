import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  Eye,
  Glasses,
  HeartPulse,
  Pill,
  ShieldAlert,
  Syringe,
} from 'lucide-react';
import type { Comorbidades } from '../types/exam-result';

interface CardComorbidadesProps {
  comorbidades?: Comorbidades;
}

type Item = {
  key: string;
  label: string;
  value: boolean;
  icon: React.ReactNode;
};

export function CardComorbidades({ comorbidades }: CardComorbidadesProps) {
  if (!comorbidades) {
    return (
      <Card className="h-full w-full border border-border/70 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              Comorbidades
            </h3>
          </div>
        </div>

        <p className="text-sm leading-5 text-muted-foreground">
          Nenhuma informação de comorbidades foi informada para este exame.
        </p>
      </Card>
    );
  }

  const items: Item[] = [
    {
      key: 'diabetes',
      label: 'Diabetes',
      value: comorbidades.diabetes,
      icon: <Activity className="h-3.5 w-3.5" />,
    },
    {
      key: 'diabetesUsoInsulina',
      label: 'Uso de insulina',
      value: comorbidades.diabetesUsoInsulina,
      icon: <Syringe className="h-3.5 w-3.5" />,
    },
    {
      key: 'diabetesControlado',
      label: 'Diabetes controlado',
      value: comorbidades.diabetesControlado,
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
    },
    {
      key: 'hipertensao',
      label: 'Hipertensão',
      value: comorbidades.hipertensao,
      icon: <HeartPulse className="h-3.5 w-3.5" />,
    },
    {
      key: 'hipertensaoControlada',
      label: 'Hipertensão controlada',
      value: comorbidades.hipertensaoControlada,
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
    },
    {
      key: 'altaMiopia',
      label: 'Alta miopia',
      value: comorbidades.altaMiopia,
      icon: <Glasses className="h-3.5 w-3.5" />,
    },
    {
      key: 'glaucoma',
      label: 'Glaucoma',
      value: comorbidades.glaucoma,
      icon: <Eye className="h-3.5 w-3.5" />,
    },
    {
      key: 'usoHidroxicloroquina',
      label: 'Hidroxicloroquina',
      value: comorbidades.usoHidroxicloroquina,
      icon: <Pill className="h-3.5 w-3.5" />,
    },
    {
      key: 'uveite',
      label: 'Uveíte',
      value: comorbidades.uveite,
      icon: <Eye className="h-3.5 w-3.5" />,
    },
    {
      key: 'catarata',
      label: 'Catarata',
      value: comorbidades.catarata,
      icon: <Eye className="h-3.5 w-3.5" />,
    },
    {
      key: 'outrasComorbidades',
      label: 'Outras comorbidades',
      value: comorbidades.outrasComorbidades,
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    {
      key: 'qualidadeTecnicaDificuldade',
      label: 'Dificuldade técnica',
      value: comorbidades.qualidadeTecnicaDificuldade,
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
  ];

  const activeItems = items.filter((item) => item.value);
  const positivas = activeItems.length;

  return (
    <Card className="flex h-full w-full flex-col border border-border/70 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              Comorbidades
            </h3>
          </div>
        </div>

        <Badge variant={positivas > 0 ? 'affirmative' : 'secondary'}>
          {positivas}
        </Badge>
      </div>

      <div className="flex-1 min-h-0 space-y-3">
        {positivas > 0 ? (
          <div className="grid max-h-55 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-2">
            {activeItems.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {item.icon}
                    </div>

                    <span className="truncate text-xs font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>

                  <Badge variant="affirmative">Sim</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 px-3 py-3">
            <p className="text-sm leading-5 text-muted-foreground">
              Nenhuma comorbidade ativa informada.
            </p>
          </div>
        )}

        {comorbidades.diabetes && comorbidades.diabetesAnos !== null && (
          <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
            <p className="text-xs font-semibold text-foreground">
              Tempo de diabetes
            </p>
            <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
              {comorbidades.diabetesAnos} anos
            </p>
          </div>
        )}

        {comorbidades.outrasComorbidades &&
          comorbidades.outrasComorbidadesDescricao && (
            <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
              <p className="text-xs font-semibold text-foreground">
                Outras comorbidades
              </p>
              <p className="mt-0.5 break-words text-sm leading-5 text-muted-foreground">
                {comorbidades.outrasComorbidadesDescricao}
              </p>
            </div>
          )}
      </div>
    </Card>
  );
}
