import { api } from '@/shared/api';
import type { CreateExamDTO } from '../types/exam';

export async function createExam(data: CreateExamDTO) {
  const response = await api.post('/api/exams', data);

  return response.data;
}
