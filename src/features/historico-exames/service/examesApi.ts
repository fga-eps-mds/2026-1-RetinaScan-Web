import type { ExameHistory } from '../types/exam-history';

const BASE_URL =
  (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000';

type BackendExamItem = {
  id: string;
  nomeCompleto: string;
  dtCriacao: string;
  olho: string;
  status: string;
};
function mapToExameHistory(item: BackendExamItem): ExameHistory {
  const randomScore = Math.floor(Math.random() * 101);

  const score = randomScore;

  // Mock status based on score thresholds:
  // score >= 80 -> Prioridade
  // 30 <= score < 80 -> Normal
  // score < 30 -> Pendente
  let mockedStatus: ExameHistory['status'];

  if (score >= 80) mockedStatus = 'Prioridade';
  else if (score >= 30) mockedStatus = 'Normal';
  else mockedStatus = 'Pendente';

  return {
    idExame: item.id,
    nomePaciente: item.nomeCompleto,
    olho: (item.olho as ExameHistory['olho']) || 'Ambos',
    scoreIA: String(score),
    status: mockedStatus,
    data: item.dtCriacao,
  };
}

export async function fetchExames(token?: string): Promise<ExameHistory[]> {
  const resp = await fetch(`${BASE_URL}/api/exams`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!resp.ok) {
    const err = new Error('Erro ao buscar exames') as Error & { status?: number };
    err.status = resp.status;
    throw err;
  }

  const body = await resp.json();

  const items: BackendExamItem[] = Array.isArray(body)
    ? body
    : (body?.data ?? []);

  return items.map(mapToExameHistory);
}

export default { fetchExames };
