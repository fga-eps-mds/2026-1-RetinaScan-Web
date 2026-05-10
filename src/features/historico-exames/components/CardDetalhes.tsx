import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { ResultadoExameMock } from '../mocks/relatorioMock';
import { detalhesRelatorioMock } from '../mocks/relatorioMock';

interface CardDetalhesProps {
  detalhes?: Partial<ResultadoExameMock>;
}

export function CardDetalhes({
  detalhes = detalhesRelatorioMock,
}: CardDetalhesProps) {
  return (
    <Card className="w-full max-w-100 h-62 border-0.5 p-6">
      <div className="mb-2 flex items-center gap-2 border-b border-border pb-2 font-semibold text-lg text-foreground">
        <span>Detalhes da Análise</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div>
            <label className="text-sm font-bold text-foreground">
              ID da Análise
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {detalhes.idExame}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">
              ID do Paciente
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {detalhes.idPaciente}
            </p>
          </div>
          <div>
            <label className="text-sm font-bold text-foreground">
              Data e hora
            </label>
            <p className="mt-1 flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {detalhes.dataHora}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-sm font-bold text-foreground">
              Nome do Paciente
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {detalhes.nomePaciente}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">
              Nome do Médico
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {detalhes.nomeMedico}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
