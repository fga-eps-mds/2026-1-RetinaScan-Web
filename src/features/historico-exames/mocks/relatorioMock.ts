import type { ExameHistory } from '../types/exam-history';

export const MOCK_HISTORICO: ExameHistory[] = [
  { 
    idExame: "EX-2026-0036", 
    nomePaciente: "Carlos Silva", 
    olho: "Ambos", 
    scoreIA: "91", 
    status: "Prioridade", 
    data: "18/04/2026" 
  },
  { 
    idExame: "EX-2026-0035", 
    nomePaciente: "Maria Oliveira", 
    olho: "Direito", 
    scoreIA: "23", 
    status: "Normal", 
    data: "11/04/2026" 
  },
    { 
    idExame: "EX-2026-0037", 
    nomePaciente: "João Santos", 
    olho: "Esquerdo", 
    scoreIA: "--", 
    status: "Pendente", 
    data: "11/04/2026" 
  }
];

export type ResultadoExameMock = {
  idExame: string;
  idPaciente: string;
  nomePaciente: string;
  nomeMedico: string;
  dataHora: string;
  resultado: string;
  recomendacao: string;
};

const resultadoExamesMock: Record<string, ResultadoExameMock> = {
  'EX-2026-0036': {
    idExame: 'EX-2026-0036',
    idPaciente: '0001',
    nomePaciente: 'Carlos Silva',
    nomeMedico: 'Dra. Ana Souza',
    dataHora: '18/04/2026 10:20',
    resultado: 'Prioridade',
    recomendacao:
      'O scan de retina apresenta alterações importantes. Recomenda-se avaliação oftalmológica o quanto antes.',
  },
  'EX-2026-0035': {
    idExame: 'EX-2026-0035',
    idPaciente: '0002',
    nomePaciente: 'Maria Oliveira',
    nomeMedico: 'Dr. Bruno Lima',
    dataHora: '11/04/2026 09:15',
    resultado: 'Normal',
    recomendacao:
      'O scan de retina apresenta aspecto normal. Continue o monitoramento conforme a recomendação médica.',
  },
  'EX-2026-0037': {
    idExame: 'EX-2026-0037',
    idPaciente: '0003',
    nomePaciente: 'João Santos',
    nomeMedico: 'Dr. Carlos Pereira',
    dataHora: '11/04/2026 13:40',
    resultado: 'Pendente',
    recomendacao:
      'O exame ainda está em processamento. Aguarde a conclusão da análise.',
  },
};

export const getResultadoExameMock = (id?: string) => {
  return resultadoExamesMock[id ?? ''] ?? resultadoExamesMock['EX-2026-0036'];
};

export const analisePositivaMock = {
  resultado: 'Normal',
  recomendacao:
    'O scan de retina apresenta aspecto normal. Continue o monitoramento conforme a recomendação médica.',
};

export const analiseNegativaMock = {
  resultado: 'Necessita Especialista',
  recomendacao:
    'O scan de retina apresenta aspecto alterado. Recomenda-se avaliação oftamológica em até 3 semanas.',
};

export const detalhesRelatorioMock = {
  idExame: 'RA-001',
  idPaciente: '0003',
  nomePaciente: 'João da Silva',
  nomeMedico: 'Dr. Carlos Pereira',
  dataHora: '10/05/2023 14:30',
};