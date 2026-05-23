import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import type { ResultadoExameMock } from '../mocks/relatorioMock';
import { analisePositivaMock } from '../mocks/relatorioMock';
import type { ExamResultAiResult } from '../types/exam-result';

interface CardResultadoProps {
  resultado?: Partial<ResultadoExameMock>;
  resultadosIa?: ExamResultAiResult[];
}

export function CardResultado({
  resultado = analisePositivaMock,
  resultadosIa = [],
}: CardResultadoProps) {
  const hasApiResults = resultadosIa.length > 0;

  return (
    <Card className="w-full max-w-250 h-62 border-0.5 p-8">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-2">
        <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
          <Brain className="h-4 w-4" />
          <span>Análise da Inteligência Artificial</span>
        </div>

        <Badge variant={hasApiResults ? 'affirmative' : 'affirmative'}>
          {hasApiResults ? 'Processado' : resultado.resultado}
        </Badge>
      </div>

      {hasApiResults ? (
        <div className="space-y-4">
          {resultadosIa.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {item.lateralidadeOlho === 'OD' ? 'Olho direito (OD)' : 'Olho esquerdo (OE)'}
                </span>
                <Badge variant={item.predictedClass === 0 ? 'affirmative' : 'destructive'}>
                  {item.predictedLabel}
                </Badge>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                Confiança: {(item.confidence * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted-foreground">
            Recomendação clínica
          </label>
          <p className="text-sm leading-6">
            {resultado.recomendacao}
          </p>
        </div>
      )}

      <div className="mt-5 flex max-w-64 gap-3">
        <Button variant="destructive" className="flex-1 gap-2 px-4 font-semibold">
          Rejeitar
        </Button>
        <Button variant="affirmative" className="flex-1 gap-2 px-4 font-semibold">
          Validar
        </Button>
      </div>
    </Card>
  );
}
