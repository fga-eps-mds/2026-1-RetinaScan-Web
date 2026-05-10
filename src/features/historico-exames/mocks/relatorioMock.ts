import type { ExameHistory } from '../types/exam-history';

export const MOCK_HISTORICO: ExameHistory[] = [
  { 
    id: "EX-2026-0036", 
    paciente: "PAC-1187", 
    olho: "Ambos", 
    scoreIA: 91, 
    status: "Prioridade", 
    data: "18/04/2026" 
  },
  { 
    id: "EX-2026-0035", 
    paciente: "PAC-2200", 
    olho: "Direito", 
    scoreIA: 23, 
    status: "Normal", 
    data: "11/04/2026" 
  }
];

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
  idAnalise: 'RA-001',
  idPaciente: '0003',
  nomePaciente: 'João da Silva',
  nomeMedico: 'Dr. Carlos Pereira',
  dataHora: '10/05/2023 14:30',
};