import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { ResultadoExameMock } from '../mocks/relatorioMock';
import { detalhesRelatorioMock } from '../mocks/relatorioMock';
import type { ExamResultExam } from '../types/exam-result';

interface CardDetalhesProps {
  detalhes?: Partial<ResultadoExameMock>;
  exame?: ExamResultExam;
}

export function CardDetalhes({
  detalhes = detalhesRelatorioMock,
  exame,
}: CardDetalhesProps) {
  if (!exame) {
    return (
      <Card className="w-full max-w-400 max-h-62 overflow-y-auto border-0.5 p-6">
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

  const patientName = exame?.nomeCompleto ?? detalhes.nomePaciente;
  const analysisId = exame?.id ?? detalhes.idExame;
  const patientId = exame?.idUsuario ?? detalhes.idPaciente;
  const dateTime = exame?.dtHora ?? detalhes.dataHora;
  const cpf = exame?.cpf;
  const birthDate = exame?.dtNascimento;
  const status = exame?.status;
  const eye = exame?.olho;

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
              {analysisId}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">
              ID do Paciente
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {patientId}
            </p>
          </div>
          <div>
            <label className="text-sm font-bold text-foreground">
              Data e hora
            </label>
            <p className="mt-1 flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {dateTime}
            </p>
          </div>
                    <div>
            <label className="text-sm font-bold text-foreground">Olho</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {eye ?? 'AO'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-sm font-bold text-foreground">
              Nome do Paciente
            </label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {patientName}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">CPF</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {cpf ?? detalhes.nomeMedico}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground">Status</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {status ?? '---'}
            </p>
          </div>



          <div>
            <label className="text-sm font-bold text-foreground">Data de nascimento</label>
            <p className="mt-1 rounded-md text-sm font-semibold text-muted-foreground">
              {birthDate ?? '---'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
