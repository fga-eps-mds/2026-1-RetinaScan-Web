import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchMedicos, useGenerateShareLink } from '../hooks/useShareExam';
import { LoaderCircle, Check, Copy, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ModalCompartilharProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly examId: string;
  readonly onShareSuccess?: () => void; // Callback para atualizar a listagem na tela principal
}

type TempoAcessoOption = 'permanente' | '7_dias' | '15_dias' | '30_dias' | 'personalizado';

export function ModalCompartilhar({ isOpen, onClose, examId, onShareSuccess }: ModalCompartilharProps) {
  const [search, setSearch] = useState('');
  const [selectedMedico, setSelectedMedico] = useState<{ nomeCompleto: string; email: string; crm: string } | null>(null);
  const [tempoAcesso, setTempoAcesso] = useState<TempoAcessoOption>('7_dias');
  const [dataPersonalizada, setDataPersonalizada] = useState('');
  
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: medicos, isLoading: isSearching } = useSearchMedicos(search, isOpen && !generatedLink);
  const { mutateAsync: generateLink, isPending: isGenerating } = useGenerateShareLink(examId);

  const calcularExpiraEm = (): string | null => {
    if (tempoAcesso === 'permanente') return null;
    const hoje = new Date();
    if (tempoAcesso === '7_dias') hoje.setDate(hoje.getDate() + 7);
    else if (tempoAcesso === '15_dias') hoje.setDate(hoje.getDate() + 15);
    else if (tempoAcesso === '30_dias') hoje.setDate(hoje.getDate() + 30);
    else if (tempoAcesso === 'personalizado' && dataPersonalizada) {
      const dataEscolhida = new Date(dataPersonalizada);
      dataEscolhida.setHours(23, 59, 59, 999);
      return dataEscolhida.toISOString();
    }
    return hoje.toISOString();
  };

  const handleShare = async () => {
    if (!selectedMedico?.email || !examId) return;
    if (tempoAcesso === 'personalizado' && !dataPersonalizada) {
      toast.error('Por favor, selecione uma data de expiração.');
      return;
    }

    try {
      const expiraEm = calcularExpiraEm();
      const result = await generateLink({ email: selectedMedico.email, expiraEm });
      const linkAcesso = result.data.linkAcesso;

      setGeneratedLink(linkAcesso);

      //  MOCK: Salva o histórico no localStorage local do navegador
      const storageKey = `shares-${examId}`;
      const historicoAtual = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const novoCompartilhamento = {
        idCompartilhamento: result.data.idCompartilhamento,
        medicoNome: selectedMedico.nomeCompleto,
        medicoCrm: selectedMedico.crm,
        medicoEmail: selectedMedico.email,
        expiraEm: expiraEm,
        linkAcesso: linkAcesso,
        criadoEm: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify([novoCompartilhamento, ...historicoAtual]));
      
      // Avisa a tela principal para atualizar a lista visual
      if (onShareSuccess) onShareSuccess();

      toast.success(result.message || 'Exame compartilhado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível compartilhar o exame.');
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseInternal = () => {
    setSearch('');
    setSelectedMedico(null);
    setTempoAcesso('7_dias');
    setDataPersonalizada('');
    setGeneratedLink(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseInternal}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Compartilhar Exame</DialogTitle>
          <DialogDescription>
            Busque por nome, CRM ou e-mail e defina o tempo de acesso concedido ao médico.
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Buscar médico</label>
              <Input
                placeholder="Digite Nome, CRM ou E-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Buscando profissionais...</span>
              </div>
            )}

            {medicos && medicos.length > 0 && (
              <div className="max-h-[140px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {medicos.map((medico) => (
                  <button
                    key={medico.id}
                    type="button"
                    onClick={() => setSelectedMedico({ nomeCompleto: medico.nomeCompleto, email: medico.email, crm: medico.crm })}
                    className={`w-full text-left p-2.5 text-sm transition-colors hover:bg-muted block ${
                      selectedMedico?.email === medico.email ? 'bg-primary/10 hover:bg-primary/15' : ''
                    }`}
                  >
                    <p className="font-medium text-foreground">{medico.nomeCompleto}</p>
                    <p className="text-xs text-muted-foreground">CRM: {medico.crm} • {medico.email}</p>
                  </button>
                ))}
              </div>
            )}

            {search.length > 2 && medicos?.length === 0 && !isSearching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-1">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>Nenhum profissional localizado.</span>
              </div>
            )}

            {selectedMedico && (
              <div className="space-y-3 border-t border-border pt-3">
                <label className="text-xs font-semibold text-muted-foreground">Tempo de Acesso</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {/* Opções de tempo */}
                  <label className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50">
                    <input type="radio" name="tempoAcesso" checked={tempoAcesso === 'permanente'} onChange={() => setTempoAcesso('permanente')} className="accent-primary" />
                    <span>Permanente</span>
                  </label>
                  <label className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50">
                    <input type="radio" name="tempoAcesso" checked={tempoAcesso === '7_dias'} onChange={() => setTempoAcesso('7_dias')} className="accent-primary" />
                    <span>7 dias</span>
                  </label>
                  <label className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50">
                    <input type="radio" name="tempoAcesso" checked={tempoAcesso === '15_dias'} onChange={() => setTempoAcesso('15_dias')} className="accent-primary" />
                    <span>15 dias</span>
                  </label>
                  <label className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50">
                    <input type="radio" name="tempoAcesso" checked={tempoAcesso === '30_dias'} onChange={() => setTempoAcesso('30_dias')} className="accent-primary" />
                    <span>30 dias</span>
                  </label>
                  <label className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50 col-span-2">
                    <input type="radio" name="tempoAcesso" checked={tempoAcesso === 'personalizado'} onChange={() => setTempoAcesso('personalizado')} className="accent-primary" />
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Data Personalizada</span>
                  </label>
                </div>

                {tempoAcesso === 'personalizado' && (
                  <div className="pt-1">
                    <Input type="date" min={new Date().toISOString().split('T')[0]} value={dataPersonalizada} onChange={(e) => setDataPersonalizada(e.target.value)} />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCloseInternal}>Cancelar</Button>
              <Button type="button" disabled={!selectedMedico || isGenerating} onClick={handleShare}>
                {isGenerating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Gerar Link
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Link Direto Gerado</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedLink} className="bg-muted text-sm font-mono" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={handleCloseInternal}>Concluir</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}