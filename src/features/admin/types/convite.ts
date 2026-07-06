import * as XLSX from 'xlsx';

// Tipos e funções auxiliares para lidar com convites de médicos e especialistas
type TipoPerfil = 'MEDICO' | 'ESPECIALISTA';

export type ConvitePayload = {
  nome: string;
  email: string;
  tipoPerfil: TipoPerfil;
};

export type LinhaBruta = Record<string, unknown>;

export function normalizarTexto(valor: unknown): string {
  return String(valor ?? '').trim();
}

export function normalizarCabecalho(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function getCampo(row: LinhaBruta, aliases: string[]): unknown {
  for (const [key, value] of Object.entries(row)) {
    const chaveNormalizada = normalizarCabecalho(key);

    if (aliases.includes(chaveNormalizada)) {
      return value;
    }
  }

  return undefined;
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizarTipoPerfil(valor: unknown): TipoPerfil | null {
  const tipo = normalizarTexto(valor).toUpperCase();

  if (tipo === 'MEDICO' || tipo === 'ESPECIALISTA') {
    return tipo;
  }

  return null;
}

export function linhaVazia(row: LinhaBruta): boolean {
  return Object.values(row).every((value) => !normalizarTexto(value));
}

export function parseConvitesPlanilha(sheet: XLSX.WorkSheet): ConvitePayload[] {
  const rows = XLSX.utils.sheet_to_json<LinhaBruta>(sheet, {
    defval: '',
    raw: false,
  });

  const convites = rows
    .filter((row: LinhaBruta) => !linhaVazia(row))
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
