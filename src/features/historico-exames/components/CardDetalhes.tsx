import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText } from 'lucide-react';
import type { ExamResultExam } from '../types/exam-result';
import { statusMapper } from '@/utils/mappers/statusMapper';
import { ModalProntuario } from './ModalProntuario';

interface CardDetalhesProps {
  exame: ExamResultExam;
}

export function CardDetalhes({ exame }: CardDetalhesProps) {
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);

  return (
    <>
      <Card className="h-full w-full border border-border/70 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2">
          <span className="text-base font-semibold text-foreground">
            Detalhes do Exame
          </span>

          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => setIsProntuarioOpen(true)}
          >
            <FileText className="h-4 w-4" />
            Ver prontuário
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground">
                ID do Exame
              </label>
              <p className="mt-0.5 break-all text-sm leading-5 text-muted-foreground">
                {exame.id}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Nome do Médico
              </label>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                {exame.medico.nomeCompleto}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Data e hora
              </label>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm leading-5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{new Date(exame.dtHora).toLocaleString()}</span>
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Olho
              </label>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                {exame.olho ?? 'AO'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Nome do Paciente
              </label>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                {exame.nomeCompleto}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                CPF
              </label>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                {exame.cpf}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Status
              </label>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                {statusMapper[exame.status] || exame.status}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Data de nascimento
              </label>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                {new Date(exame.dtNascimento).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <ModalProntuario
        isOpen={isProntuarioOpen}
        onClose={() => setIsProntuarioOpen(false)}
        prontuario={exame.descricao}
        paciente={exame.nomeCompleto}
      />
    </>
  );
}
