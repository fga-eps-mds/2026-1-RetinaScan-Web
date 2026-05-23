import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { ExamResultExam } from '../types/exam-result';

interface CardDetalhesProps {
  exame: ExamResultExam;
}

export function CardDetalhes({ exame }: CardDetalhesProps) {
  return (
    <Card className="mx-auto w-full max-w-400 max-h-62 overflow-y-auto border-0.5 p-6">
      <div className="mb-2 flex items-center gap-2 border-b border-border pb-2 font-semibold text-lg text-foreground">
        <span>Detalhes do Exame</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div>
            <label className="text-sm font-bold text-foreground">ID do Exame</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {exame.id}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">
              Nome do Médico
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {exame.medico.nomeCompleto}
            </p>
          </div>
          <div>
            <label className="text-sm font-bold text-foreground">
              Data e hora
            </label>
            <p className="mt-1 flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(exame.dtHora).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-bold text-foreground">Olho</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {exame.olho ?? 'AO'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-sm font-bold text-foreground">
              Nome do Paciente
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {exame.nomeCompleto}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">CPF</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {exame.cpf}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">Status</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {exame.status}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">Data de nascimento</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {exame.dtNascimento}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}