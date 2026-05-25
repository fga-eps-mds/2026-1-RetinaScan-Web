import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  XCircle,
} from 'lucide-react';
import type {
  ExamResultAiResult,
  ExamResultPayload,
  ExamStatus,
} from '../types/exam-result';
import { statusMapper } from '@/utils/mappers/statusMapper';

interface CardResultadoProps {
  payload?: Partial<ExamResultPayload>;
}

type BadgeVariant = 'affirmative' | 'destructive' | 'secondary' | 'outline';

const statusConfig: Record<
  ExamStatus,
  {
    badgeVariant: BadgeVariant;
    minHeight: string;
    emptyTitle: string;
    emptyDescription: string;
    icon: React.ReactNode;
  }
> = {
  CRIADO: {
    badgeVariant: 'secondary',
    minHeight: 'min-h-[180px]',
    emptyTitle: 'Análise pendente',
    emptyDescription:
      'O exame foi criado, mas ainda não iniciou o processamento pela inteligência artificial.',
    icon: <Clock3 className="h-4 w-4" />,
  },
  EM_PROCESSAMENTO: {
    badgeVariant: 'secondary',
    minHeight: 'min-h-[190px]',
    emptyTitle: 'Análise em processamento',
    emptyDescription:
      'A inteligência artificial está processando este exame. Aguarde a conclusão.',
    icon: <LoaderCircle className="h-4 w-4 animate-spin" />,
  },
  CONCLUIDO: {
    badgeVariant: 'affirmative',
    minHeight: 'min-h-[200px]',
    emptyTitle: 'Nenhum resultado disponível',
    emptyDescription:
      'O exame foi concluído, mas nenhum resultado de IA foi encontrado.',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  ERRO_PROCESSAMENTO: {
    badgeVariant: 'destructive',
    minHeight: 'min-h-[185px]',
    emptyTitle: 'Erro no processamento',
    emptyDescription:
      'Ocorreu uma falha durante o processamento da análise automatizada.',
    icon: <XCircle className="h-4 w-4" />,
  },
};

export function CardResultado({ payload }: CardResultadoProps) {
  const exam = payload?.exam;
  const resultadosIa: ExamResultAiResult[] = payload?.resultadosIa ?? [];

  const status: ExamStatus = exam?.status ?? 'CRIADO';
  const currentStatus = statusConfig[status] ?? statusConfig.CRIADO;

  const isConcluido = status === 'CONCLUIDO';
  const hasAiResults = isConcluido && resultadosIa.length > 0;

  return (
    <Card
      className={[
        'flex w-full max-w-none flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:p-5',
        currentStatus.minHeight,
      ].join(' ')}
    >
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Brain className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight text-foreground md:text-base">
              Análise da Inteligência Artificial
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Resultado assistido para validação clínica
            </p>
          </div>
        </div>

        <Badge
          variant={currentStatus.badgeVariant as never}
          className="shrink-0"
        >
          {statusMapper[status] || currentStatus.emptyTitle}
        </Badge>
      </div>

      <div className="flex-1">
        {hasAiResults ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {resultadosIa.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/70 bg-muted/30 p-3"
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {item.lateralidadeOlho === 'OD'
                      ? 'Olho direito (OD)'
                      : 'Olho esquerdo (OE)'}
                  </span>

                  <Badge
                    variant={
                      item.predictedClass === 0 ? 'affirmative' : 'destructive'
                    }
                    className="w-fit"
                  >
                    {item.predictedLabel === 'normal' ? 'Normal' : 'Alterado'}
                  </Badge>
                </div>

                <p className="text-sm leading-5 text-muted-foreground">
                  Confiança do modelo:{' '}
                  <span className="font-medium text-foreground">
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                {status === 'ERRO_PROCESSAMENTO' ? (
                  <CircleAlert className="h-4 w-4" />
                ) : (
                  currentStatus.icon
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  {currentStatus.emptyTitle}
                </p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {currentStatus.emptyDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
