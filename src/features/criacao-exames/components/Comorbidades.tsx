import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export type ComorbidadesFormValue = {
  diabetes: boolean;
  diabetesAnos?: number;
  diabetesUsoInsulina: boolean;
  diabetesControlado: boolean;
  hipertensao: boolean;
  hipertensaoControlada: boolean;
  altaMiopia: boolean;
  glaucoma: boolean;
  usoHidroxicloroquina: boolean;
  uveite: boolean;
  catarata: boolean;
  outrasComorbidades: boolean;
  outrasComorbidadesDescricao?: string;
  qualidadeTecnicaDificuldade: boolean;
};

type ComorbidadesProps = {
  value: ComorbidadesFormValue;
  onChange: (value: ComorbidadesFormValue) => void;
  error?: string | null;
  onClearError?: () => void;
};

export function Comorbidades({
  value,
  onChange,
  error,
  onClearError,
}: ComorbidadesProps) {
  const update = <K extends keyof ComorbidadesFormValue>(
    field: K,
    fieldValue: ComorbidadesFormValue[K]
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
    onClearError?.();
  };

  return (
    <Card className="p-4">
      <label className="text-sm font-semibold">Comorbidades</label>

      <div className="mt-4 space-y-4">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.diabetes}
              onCheckedChange={(checked) => {
                const enabled = checked === true;

                onChange({
                  ...value,
                  diabetes: enabled,
                  diabetesAnos: enabled ? value.diabetesAnos : undefined,
                  diabetesUsoInsulina: enabled
                    ? value.diabetesUsoInsulina
                    : false,
                  diabetesControlado: enabled
                    ? value.diabetesControlado
                    : false,
                });
                onClearError?.();
              }}
            />
            <span>Diabetes</span>
          </label>

          {value.diabetes && (
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
                  value={value.diabetesAnos ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value;

                    update(
                      'diabetesAnos',
                      raw === '' ? undefined : Number(raw)
                    );
                  }}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={value.diabetesUsoInsulina}
                  onCheckedChange={(checked) =>
                    update('diabetesUsoInsulina', checked === true)
                  }
                />
                <span>Uso de insulina</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={value.diabetesControlado}
                  onCheckedChange={(checked) =>
                    update('diabetesControlado', checked === true)
                  }
                />
                <span>Diabetes controlado</span>
              </label>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.hipertensao}
              onCheckedChange={(checked) => {
                const enabled = checked === true;

                onChange({
                  ...value,
                  hipertensao: enabled,
                  hipertensaoControlada: enabled
                    ? value.hipertensaoControlada
                    : false,
                });
                onClearError?.();
              }}
            />
            <span>Hipertensão</span>
          </label>

          {value.hipertensao && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value.hipertensaoControlada}
                onCheckedChange={(checked) =>
                  update('hipertensaoControlada', checked === true)
                }
              />
              <span>Hipertensão controlada</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.altaMiopia}
              onCheckedChange={(checked) =>
                update('altaMiopia', checked === true)
              }
            />
            <span>Alta miopia</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.glaucoma}
              onCheckedChange={(checked) =>
                update('glaucoma', checked === true)
              }
            />
            <span>Glaucoma</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.usoHidroxicloroquina}
              onCheckedChange={(checked) =>
                update('usoHidroxicloroquina', checked === true)
              }
            />
            <span>Uso de hidroxicloroquina</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.uveite}
              onCheckedChange={(checked) => update('uveite', checked === true)}
            />
            <span>Uveíte</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.catarata}
              onCheckedChange={(checked) =>
                update('catarata', checked === true)
              }
            />
            <span>Catarata</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.outrasComorbidades}
              onCheckedChange={(checked) => {
                const enabled = checked === true;

                onChange({
                  ...value,
                  outrasComorbidades: enabled,
                  outrasComorbidadesDescricao: enabled
                    ? value.outrasComorbidadesDescricao
                    : undefined,
                });
                onClearError?.();
              }}
            />
            <span>Outras</span>
          </label>

          {value.outrasComorbidades && (
            <div>
              <label
                htmlFor="outrasComorbidadesDescricao"
                className="text-xs font-medium"
              >
                Descreva a comorbidade
              </label>
              <Input
                id="outrasComorbidadesDescricao"
                value={value.outrasComorbidadesDescricao ?? ''}
                onChange={(event) =>
                  update(
                    'outrasComorbidadesDescricao',
                    event.target.value || undefined
                  )
                }
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

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.qualidadeTecnicaDificuldade}
              onCheckedChange={(checked) =>
                update('qualidadeTecnicaDificuldade', checked === true)
              }
            />
            <span>Sim</span>
          </label>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </Card>
  );
}
