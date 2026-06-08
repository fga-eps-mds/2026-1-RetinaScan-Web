import { describe, it, expect, vi } from 'vitest';
import { createSpecialistReport } from '@/features/historico-exames/api/createSpecialistReport';
import { updateSpecialistReport } from '@/features/historico-exames/api/updateSpecialistReport';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Funções de chamadas de API do Laudo', () => {
  it('createSpecialistReport deve isolar examId na rota e passar o restante no body', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'new-report-id' } });

    const payload = {
      examId: '12345678-1234-1234-1234-1234567890ab',
      texto: 'Texto do teste',
      html: '<p>HTML</p>',
      json: null,
      resultadoIaValido: true,
    };

    const res = await createSpecialistReport(payload);

    expect(api.post).toHaveBeenCalledWith('/api/report/12345678-1234-1234-1234-1234567890ab/create', {
      texto: 'Texto do teste',
      html: '<p>HTML</p>',
      json: null,
      resultadoIaValido: true,
    });
    expect(res).toEqual({ id: 'new-report-id' });
  });

  it('updateSpecialistReport deve fazer put na rota de update com os dados atualizados', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { message: 'Updated' } });

    const payload = {
      examId: '12345678-1234-1234-1234-1234567890ab',
      texto: 'Texto alterado',
      resultadoIaValido: false,
      html: '<p>HTML alterado</p>',
      json: {},
    };

    const res = await updateSpecialistReport(payload);

    expect(api.put).toHaveBeenCalledWith('/api/report/12345678-1234-1234-1234-1234567890ab/update', {
      texto: 'Texto alterado',
      resultadoIaValido: false,
      html: '<p>HTML alterado</p>',
      json: {},
    });
    expect(res).toEqual({ message: 'Updated' });
  });
});