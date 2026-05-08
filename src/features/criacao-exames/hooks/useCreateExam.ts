import { useMutation } from '@tanstack/react-query';
import { createExam } from '../api/createExam';

export function useCreateExam() {
  return useMutation({
    mutationFn: createExam,
  });
}
