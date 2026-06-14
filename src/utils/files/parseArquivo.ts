import {
  getCampo,
  normalizarTexto,
  normalizarTipoPerfil,
  validarEmail,
  type ConvitePayload,
  type LinhaBruta,
} from '@/features/admin/types/convite';
import * as XLSX from 'xlsx';

export async function parseArquivo(file: File): Promise<ConvitePayload[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<LinhaBruta>(sheet, {
    defval: '',
    raw: false,
  });

  const convites = rows
    .filter((row: { [s: string]: unknown } | ArrayLike<unknown>) =>
      Object.values(row).some((value) => normalizarTexto(value) !== '')
    )
    .map((row: LinhaBruta, index: number) => {
      const nome = normalizarTexto(getCampo(row, ['nome']));

      const email = normalizarTexto(
        getCampo(row, ['email', 'e-mail'])
      ).toLowerCase();

      const tipoPerfil = normalizarTipoPerfil(
        getCampo(row, [
          'tipo de perfil',
          'tipo perfil',
          'tipoperfil',
          'tipo_perfil',
          'perfil',
        ])
      );

      if (!nome) {
        throw new Error(`Linha ${index + 2}: nome obrigatório.`);
      }

      if (!validarEmail(email)) {
        throw new Error(`Linha ${index + 2}: email inválido.`);
      }

      if (!tipoPerfil) {
        throw new Error(
          `Linha ${index + 2}: tipoPerfil deve ser MEDICO ou ESPECIALISTA.`
        );
      }

      return {
        nome,
        email,
        tipoPerfil,
      };
    });

  return convites;
}
