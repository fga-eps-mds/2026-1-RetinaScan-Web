import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { detalhesRelatorioMock } from '../mocks/relatorioMock';

export function CardDetalhes() {
  return (
    <Card className="w-full max-w-100 h-64 border-0.5 p-6">
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
              {detalhesRelatorioMock.idAnalise}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">
            ID do Paciente
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {detalhesRelatorioMock.idPaciente}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">
            Nome do Paciente
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {detalhesRelatorioMock.nomePaciente}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-sm font-bold text-foreground">
            Nome do Médico
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {detalhesRelatorioMock.nomeMedico}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">Data e hora</label>
            <p className="mt-1 flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {detalhesRelatorioMock.dataHora}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
