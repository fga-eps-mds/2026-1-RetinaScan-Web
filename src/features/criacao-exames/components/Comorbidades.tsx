import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

type OpcaoSimNao = 'SIM' | 'NAO' | '';

type ComorbidadesProps = {
  onChange: (value: string) => void;
  error?: string | null;
  onClearError?: () => void;
};

type ComorbidadesState = {
  diabetes: boolean;
  diabetesAnos: string;
  diabetesUsoInsulina: OpcaoSimNao;
  diabetesControlado: OpcaoSimNao;
  hipertensao: boolean;
  hipertensaoControlada: OpcaoSimNao;
  altaMiopia: boolean;
  glaucoma: boolean;
  usoHidroxicloroquina: boolean;
  uveite: boolean;
  catarata: boolean;
  outrasComorbidades: boolean;
  outrasComorbidadesDescricao: string;
  qualidadeTecnicaDificuldade: OpcaoSimNao;
};

const createSummary = (state: ComorbidadesState): string => {
  const parts: string[] = [];

  if (state.diabetes) {
    const diabetesDetails: string[] = [];

    if (state.diabetesAnos.trim()) {
      diabetesDetails.push(`${state.diabetesAnos.trim()} anos`);
    }

    if (state.diabetesUsoInsulina) {
      diabetesDetails.push(
        state.diabetesUsoInsulina === 'SIM'
          ? 'com uso de insulina'
          : 'sem uso de insulina'
      );
    }

    if (state.diabetesControlado) {
      diabetesDetails.push(
        state.diabetesControlado === 'SIM' ? 'controlado' : 'não controlado'
      );
    }

    parts.push(
      diabetesDetails.length > 0
        ? `Diabetes (${diabetesDetails.join(', ')})`
        : 'Diabetes'
    );
  }

  if (state.hipertensao) {
    parts.push(
      `Hipertensão${
        state.hipertensaoControlada
          ? ` (${state.hipertensaoControlada === 'SIM' ? 'controlada' : 'não controlada'})`
          : ''
      }`
    );
  }

  if (state.altaMiopia) {
    parts.push('Alta miopia');
  }

  if (state.glaucoma) {
    parts.push('Glaucoma');
  }

  if (state.usoHidroxicloroquina) {
    parts.push('Uso de hidroxicloroquina');
  }

  if (state.uveite) {
    parts.push('Uveíte');
  }

  if (state.catarata) {
    parts.push('Catarata');
  }

  if (state.outrasComorbidades) {
    const descricao = state.outrasComorbidadesDescricao.trim();

    parts.push(descricao ? `Outras: ${descricao}` : 'Outras');
  }

  if (state.qualidadeTecnicaDificuldade) {
    parts.push(
      `Qualidade técnica do exame: ${
        state.qualidadeTecnicaDificuldade === 'SIM'
          ? 'houve dificuldade para realização do exame'
          : 'não houve dificuldade para realização do exame'
      }`
    );
  }

  return parts.join('; ');
};

export function Comorbidades({
  onChange,
  error,
  onClearError,
}: ComorbidadesProps) {
  const [state, setState] = useState<ComorbidadesState>({
    diabetes: false,
    diabetesAnos: '',
    diabetesUsoInsulina: '',
    diabetesControlado: '',
    hipertensao: false,
    hipertensaoControlada: '',
    altaMiopia: false,
    glaucoma: false,
    usoHidroxicloroquina: false,
    uveite: false,
    catarata: false,
    outrasComorbidades: false,
    outrasComorbidadesDescricao: '',
    qualidadeTecnicaDificuldade: '',
  });

  useEffect(() => {
    onChange(createSummary(state));
  }, [onChange, state]);

  return (
    <Card className="p-4">
      <label htmlFor="comorbidades" className="text-sm font-semibold">
        Comorbidades
      </label>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="diabetes"
              checked={state.diabetes}
              onCheckedChange={(checked) => {
                const value = checked === true;

                setState((current) => ({
                  ...current,
                  diabetes: value,
                  diabetesAnos: value ? current.diabetesAnos : '',
                  diabetesUsoInsulina: value ? current.diabetesUsoInsulina : '',
                  diabetesControlado: value ? current.diabetesControlado : '',
                }));
                onClearError?.();
              }}
            />
            <label htmlFor="diabetes" className="text-sm font-medium">
              Diabetes
            </label>
          </div>

          {state.diabetes && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label htmlFor="diabetesAnos" className="text-xs font-medium">
                  Quantos anos
                </label>
                <Input
                  id="diabetesAnos"
                  type="number"
                  min={0}
                  placeholder="Ex: 10"
                  value={state.diabetesAnos}
                  onChange={(event) => {
                    setState((current) => ({
                      ...current,
                      diabetesAnos: event.target.value,
                    }));
                    onClearError?.();
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="diabetesUsoInsulina"
                  className="text-xs font-medium"
                >
                  Uso de insulina
                </label>
                <select
                  id="diabetesUsoInsulina"
                  value={state.diabetesUsoInsulina}
                  onChange={(event) => {
                    setState((current) => ({
                      ...current,
                      diabetesUsoInsulina: event.target.value as OpcaoSimNao,
                    }));
                    onClearError?.();
                  }}
                  className={`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${state.diabetesUsoInsulina ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  <option value="SIM">Com uso de insulina</option>
                  <option value="NAO">Sem uso de insulina</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="diabetesControlado"
                  className="text-xs font-medium"
                >
                  Controle do diabetes
                </label>
                <select
                  id="diabetesControlado"
                  value={state.diabetesControlado}
                  onChange={(event) => {
                    setState((current) => ({
                      ...current,
                      diabetesControlado: event.target.value as OpcaoSimNao,
                    }));
                    onClearError?.();
                  }}
                  className={`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${state.diabetesControlado ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  <option value="SIM">Controlado</option>
                  <option value="NAO">Não controlado</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hipertensao"
              checked={state.hipertensao}
              onCheckedChange={(checked) => {
                const value = checked === true;

                setState((current) => ({
                  ...current,
                  hipertensao: value,
                  hipertensaoControlada: value
                    ? current.hipertensaoControlada
                    : '',
                }));
                onClearError?.();
              }}
            />
            <label htmlFor="hipertensao" className="text-sm font-medium">
              Hipertensão
            </label>
          </div>

          {state.hipertensao && (
            <div>
              <label
                htmlFor="hipertensaoControlada"
                className="text-xs font-medium"
              >
                Controle da hipertensão<br />
              </label>
              <select
                id="hipertensaoControlada"
                value={state.hipertensaoControlada}
                onChange={(event) => {
                  setState((current) => ({
                    ...current,
                    hipertensaoControlada: event.target.value as OpcaoSimNao,
                  }));
                  onClearError?.();
                }}
                className={`h-8 w-50 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${state.hipertensaoControlada ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                <option value="" disabled>
                  Selecione
                </option>
                <option value="SIM">Controlada</option>
                <option value="NAO">Não controlada</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="altaMiopia"
              checked={state.altaMiopia}
              onCheckedChange={(checked) => {
                setState((current) => ({
                  ...current,
                  altaMiopia: checked === true,
                }));
                onClearError?.();
              }}
            />
            <span>Alta miopia</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="glaucoma"
              checked={state.glaucoma}
              onCheckedChange={(checked) => {
                setState((current) => ({
                  ...current,
                  glaucoma: checked === true,
                }));
                onClearError?.();
              }}
            />
            <span>Glaucoma</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="usoHidroxicloroquina"
              checked={state.usoHidroxicloroquina}
              onCheckedChange={(checked) => {
                setState((current) => ({
                  ...current,
                  usoHidroxicloroquina: checked === true,
                }));
                onClearError?.();
              }}
            />
            <span>Uso de hidroxicloroquina</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="uveite"
              checked={state.uveite}
              onCheckedChange={(checked) => {
                setState((current) => ({
                  ...current,
                  uveite: checked === true,
                }));
                onClearError?.();
              }}
            />
            <span>Uveíte</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="catarata"
              checked={state.catarata}
              onCheckedChange={(checked) => {
                setState((current) => ({
                  ...current,
                  catarata: checked === true,
                }));
                onClearError?.();
              }}
            />
            <span>Catarata</span>
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="outrasComorbidades"
              checked={state.outrasComorbidades}
              onCheckedChange={(checked) => {
                const value = checked === true;

                setState((current) => ({
                  ...current,
                  outrasComorbidades: value,
                  outrasComorbidadesDescricao: value
                    ? current.outrasComorbidadesDescricao
                    : '',
                }));
                onClearError?.();
              }}
            />
            <label htmlFor="outrasComorbidades" className="text-sm font-medium">
              Outras
            </label>
          </div>

          {state.outrasComorbidades && (
            <div>
              <label
                htmlFor="outrasComorbidadesDescricao"
                className="text-xs font-medium"
              >
                Descreva a comorbidade
              </label>
              <Input
                id="outrasComorbidadesDescricao"
                value={state.outrasComorbidadesDescricao}
                onChange={(event) => {
                  setState((current) => ({
                    ...current,
                    outrasComorbidadesDescricao: event.target.value,
                  }));
                  onClearError?.();
                }}
                placeholder="Ex: Degeneração macular"
              />
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-sm font-semibold">Qualidade técnica do exame</p>
          <p className="text-sm text-muted-foreground">
            Houve alguma dificuldade para realização do exame?
          </p>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="qualidadeTecnicaDificuldade"
                value="SIM"
                checked={state.qualidadeTecnicaDificuldade === 'SIM'}
                onChange={() => {
                  setState((current) => ({
                    ...current,
                    qualidadeTecnicaDificuldade: 'SIM',
                  }));
                  onClearError?.();
                }}
              />
              <span>Sim</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="qualidadeTecnicaDificuldade"
                value="NAO"
                checked={state.qualidadeTecnicaDificuldade === 'NAO'}
                onChange={() => {
                  setState((current) => ({
                    ...current,
                    qualidadeTecnicaDificuldade: 'NAO',
                  }));
                  onClearError?.();
                }}
              />
              <span>Não</span>
            </label>
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </Card>
  );
}
