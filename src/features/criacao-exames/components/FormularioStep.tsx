import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Comorbidades, type ComorbidadesFormValue } from './Comorbidades';
import type { SexoExame } from '../types/exam';

/**
 * Contrato de propriedades (Props) do componente.
 * Este é um componente "controlado" (Controlled Component), ou seja, 
 * ele não possui estado próprio. Todo o estado e lógica de negócio 
 * são injetados pelo componente pai (NovoExame.tsx).
 */
interface FormularioStepProps {
  // Flag que indica se os dados vieram de uma extração automática (DICOM)
  isDicom: boolean;
  
  // Objeto contendo os valores atuais de todos os campos do formulário
  formData: {
    nomeCompleto: string;
    dataNascimento: string;
    sexo: SexoExame | '';
    cpf: string;
    comorbidades: ComorbidadesFormValue;
    descricao: string;
  };
  
  // Funções despachantes (setters) para atualizar o estado no componente pai
  setters: {
    setNomeCompleto: (val: string) => void;
    setDataNascimento: (val: string) => void;
    setSexo: (val: SexoExame | '') => void;
    setCpf: (val: string) => void;
    setComorbidades: (val: ComorbidadesFormValue) => void;
    setDescricao: (val: string) => void;
  };
  
  // Mapeamento de erros retornados pela API (global ou atrelado a campos específicos)
  errors: {
    global: string | null;
    fields: Record<string, string>;
  };
  
  // Função para limpar o erro de um campo específico assim que o usuário volta a digitar
  clearFieldError: (field: string) => void;
  
  // Flags de controle dos botões de ação
  isPending: boolean; // Indica se a requisição de salvamento está em andamento
  canSubmit: boolean; // Indica se o formulário passou na validação do pai e pode ser enviado
  
  // Handlers de navegação e submissão
  onBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function FormularioStep({
  isDicom, formData, setters, errors, clearFieldError, isPending, canSubmit, onBack, onSubmit
}: FormularioStepProps) {
  return (
    // O evento onSubmit é repassado para o pai, que faz o e.preventDefault() e a chamada à API
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      
      {/* Alerta Condicional: Exibido apenas no Cenário B (Upload de Imagens JPEG/PNG).
          Informa o usuário sobre a natureza manual do preenchimento. */}
      {!isDicom && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-md text-sm text-yellow-600 mb-2">
          Arquivo de imagem tradicional detectado. Os metadados não são obrigatórios e não serão enviados automaticamente. Preencha apenas se desejar armazenar no prontuário local.
        </div>
      )}

      {/* Grid responsivo para alinhar os inputs em 2 colunas em telas maiores */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <label htmlFor="nomeCompleto" className="text-sm font-bold">Nome do Paciente</label>
          <Input
            id="nomeCompleto"
            value={formData.nomeCompleto}
            onChange={(e) => { 
              // Atualiza o estado no pai e limpa o erro visual de validação simultaneamente
              setters.setNomeCompleto(e.target.value); 
              clearFieldError('nomeCompleto'); 
            }}
            placeholder="Digite o nome completo do paciente"
          />
          {/* Renderização condicional de erro para o campo nomeCompleto */}
          {errors.fields.nomeCompleto && <p className="text-xs text-destructive">{errors.fields.nomeCompleto}</p>}
        </Card>

        <Card className="p-4">
          <label htmlFor="dtNascimento" className="text-sm font-semibold">Data de nascimento</label>
          <Input
            id="dtNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={(e) => { setters.setDataNascimento(e.target.value); clearFieldError('dtNascimento'); }}
            // Controle de cor (UX): cinza quando vazio (placeholder mode) e cor padrão quando preenchido
            className={formData.dataNascimento ? 'text-foreground' : 'text-muted-foreground'}
          />
          {errors.fields.dtNascimento && <p className="text-xs text-destructive">{errors.fields.dtNascimento}</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <label htmlFor="sexo" className="text-sm font-semibold">Sexo</label>
          <select
            id="sexo"
            value={formData.sexo}
            // Necessário tipar o e.target.value (casting) para bater com o Enum/Type SexoExame
            onChange={(e) => { setters.setSexo(e.target.value as SexoExame); clearFieldError('sexo'); }}
            className={`h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${formData.sexo ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <option value="" disabled>Selecione o sexo</option>
            <option value="FEMININO">Feminino</option>
            <option value="MASCULINO">Masculino</option>
            <option value="OUTRO">Outro</option>
          </select>
          {errors.fields.sexo && <p className="text-xs text-destructive">{errors.fields.sexo}</p>}
        </Card>

        <Card className="p-4">
          <label htmlFor="cpf" className="text-sm font-semibold">CPF</label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={formData.cpf}
            // A formatação (máscara) acontece no setter do pai, aqui só repassamos o input sujo
            onChange={(e) => { setters.setCpf(e.target.value); clearFieldError('cpf'); }}
          />
          {errors.fields.cpf && <p className="text-xs text-destructive">{errors.fields.cpf}</p>}
        </Card>
      </div>

      {/* Componente especializado para o checklist médico. Recebe seu próprio bloco de valor e onChange */}
      <Comorbidades
        value={formData.comorbidades}
        onChange={(value) => { setters.setComorbidades(value); clearFieldError('comorbidades'); }}
        error={errors.fields.comorbidades}
        onClearError={() => clearFieldError('comorbidades')}
      />

      <Card className="p-4">
        <label htmlFor="descricao" className="text-sm font-semibold">Prontuário</label>
        <textarea
          id="descricao"
          className="w-full min-h-32 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Dê uma descrição sobre o motivo do exame"
          rows={4}
          value={formData.descricao}
          onChange={(e) => { setters.setDescricao(e.target.value); clearFieldError('descricao'); }}
        />
      </Card>

      {/* Feedback de erro global (ex: erro 500 do servidor, falha de rede) */}
      {errors.global && <p className="text-xs text-destructive">{errors.global}</p>}

      {/* Área de Ações Finais */}
      <div className="flex justify-between mt-4">
        {/* Dispara o onBack para o pai retornar o 'step' para 'UPLOAD' */}
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
        
        <Button
          type="submit"
          // O botão é bloqueado se a API estiver processando OU se o pai determinar que o form está inválido
          disabled={isPending || !canSubmit}
          className="px-10 py-4 font-semibold text-primary-foreground"
        >
          {isPending ? 'Salvando...' : 'Salvar Exame Definitivo'}
        </Button>
      </div>
    </form>
  );
}