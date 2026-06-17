import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchMedicos, useGenerateShareLink, type CompartilhamentoItem } from '../hooks/useShareExam';
import { LoaderCircle, Check, Copy, AlertCircle, Calendar, History, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ModalCompartilharProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly examId: string;
}

type TempoAcessoOption = 'permanente' | '7_dias' | '15_dias' | '30_dias' | 'personalizado';

export function ModalCompartilhar({ isOpen, onClose, examId }: ModalCompartilharProps) {
  const [search, setSearch] = useState('');
  const [selectedMedico, setSelectedMedico] = useState<{ nomeCompleto: string; email: string; crm: string } | null>(null);
  const [tempoAcesso, setTempoAcesso] = useState<TempoAcessoOption>('7_dias');
  const [dataPersonalizada, setDataPersonalizada] = useState('');

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshHistoryNonce, setRefreshHistoryNonce] = useState(0);

  const { data: medicos, isLoading: isSearching } = useSearchMedicos(search, isOpen && !generatedLink);
  const { mutateAsync: generateLink, isPending: isGenerating } = useGenerateShareLink(examId);


  const listagemCompartilhados = useMemo(() => {
    if (!examId || !isOpen) return [];
    return JSON.parse(localStorage.getItem(`shares-${examId}`) || '[]');
  }, [examId, isOpen, refreshHistoryNonce]);

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

      const result = await generateLink({
        emailDestino: selectedMedico.email,
        expiraEm
      });

      // 2. Monta o link de acesso 
      const linkAcessoGerado = `${window.location.origin}/exames/${examId}`;
      setGeneratedLink(linkAcessoGerado);

      const storageKey = `shares-${examId}`;
      const historicoAtual = JSON.parse(localStorage.getItem(storageKey) || '[]');

      const novoCompartilhamento = {
        idCompartilhamento: result.data.id,
        medicoNome: selectedMedico.nomeCompleto,
        medicoCrm: selectedMedico.crm,
        medicoEmail: selectedMedico.email,
        expiraEm: result.data.expiraEm,
        linkAcesso: linkAcessoGerado,
        criadoEm: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify([novoCompartilhamento, ...historicoAtual]));

      setRefreshHistoryNonce(prev => prev + 1);
      toast.success(result.message || 'Exame compartilhado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível compartilhar o exame.');
    }
  };
  const handleCopy = async (link: string) => {
    await navigator.clipboard.writeText(link);
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
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted/50 p-10">
        <DialogHeader>
          <DialogTitle>Gerenciamento de Acesso Controlado</DialogTitle>
          <DialogDescription>
            Compartilhe o resultado com outros profissionais e acompanhe quem possui permissões ativas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Share2 className="h-4 w-4 text-primary" />
              <span>Novo Compartilhamento</span>
            </div>

            {!generatedLink ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Buscar médico:</label>
                  <Input
                    className="w-full mt-1"
                    placeholder="Nome, CRM ou E-mail..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {isSearching && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Buscando...</span>
                  </div>
                )}

                {medicos && medicos.length > 0 && (
                  <div className="max-h-[120px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                    {medicos.map((medico) => (
                      <button
                        key={medico.id}
                        type="button"
                        onClick={() => setSelectedMedico({ nomeCompleto: medico.nomeCompleto, email: medico.email, crm: medico.crm })}
                        className={`w-full text-left p-2 text-xs block transition-colors ${selectedMedico?.email === medico.email ? 'bg-primary/10' : 'hover:bg-muted'
                          }`}
                      >
                        <p className="font-medium text-foreground">{medico.nomeCompleto}</p>
                        <p className="text-muted-foreground">CRM: {medico.crm} • {medico.email}</p>
                      </button>
                    ))}
                  </div>
                )}

                {search.length > 2 && medicos?.length === 0 && !isSearching && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center py-1">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Nenhum profissional localizado.</span>
                  </div>
                )}

                {selectedMedico && (
                  <div className="space-y-3 border-t border-border pt-3 animate-in fade-in duration-200">
                    <label className="text-xs font-semibold text-muted-foreground">Tempo de Acesso</label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <label className="flex items-center gap-2 border border-border rounded-md p-1.5 cursor-pointer hover:bg-muted/50">
                        <input type="radio" name="tempoAcesso" checked={tempoAcesso === 'permanente'} onChange={() => setTempoAcesso('permanente')} className="accent-primary" />
                        <span>Permanente</span>
                      </label>
                      <label className="flex items-center gap-2 border border-border rounded-md p-1.5 cursor-pointer hover:bg-muted/50">
                        <input type="radio" name="tempoAcesso" checked={tempoAcesso === '7_dias'} onChange={() => setTempoAcesso('7_dias')} className="accent-primary" />
                        <span>7 dias</span>
                      </label>
                      <label className="flex items-center gap-2 border border-border rounded-md p-1.5 cursor-pointer hover:bg-muted/50">
                        <input type="radio" name="tempoAcesso" checked={tempoAcesso === '15_dias'} onChange={() => setTempoAcesso('15_dias')} className="accent-primary" />
                        <span>15 dias</span>
                      </label>
                      <label className="flex items-center gap-2 border border-border rounded-md p-1.5 cursor-pointer hover:bg-muted/50">
                        <input type="radio" name="tempoAcesso" checked={tempoAcesso === '30_dias'} onChange={() => setTempoAcesso('30_dias')} className="accent-primary" />
                        <span>30 dias</span>
                      </label>
                      <label className="flex items-center gap-2 border border-border rounded-md p-1.5 cursor-pointer hover:bg-muted/50 col-span-2">
                        <input type="radio" name="tempoAcesso" checked={tempoAcesso === 'personalizado'} onChange={() => setTempoAcesso('personalizado')} className="accent-primary" />
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Data Personalizada</span>
                      </label>
                    </div>

                    {tempoAcesso === 'personalizado' && (
                      <div className="pt-1">
                        <Input type="date" min={new Date().toISOString().split('T')[0]} value={dataPersonalizada} onChange={(e) => setDataPersonalizada(e.target.value)} className="h-8 text-xs" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={handleCloseInternal}>Cancelar</Button>
                  <Button type="button" size="sm" disabled={!selectedMedico || isGenerating} onClick={handleShare}>
                    {isGenerating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Gerar Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in zoom-in-95 duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Link Direto Gerado</label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={generatedLink} className="bg-muted text-xs font-mono h-8" />
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleCopy(generatedLink)}>
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-2">
                  Pronto! O link foi salvo no painel e copiado. Você pode criar um novo acesso limpando o estado.
                </p>
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setGeneratedLink(null)}>Criar Outro</Button>
                  <Button type="button" size="sm" onClick={handleCloseInternal}>Concluir</Button>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <History className="h-4 w-4 text-muted-foreground" />
              <span>Profissionais com Acesso</span>
            </div>

            {listagemCompartilhados.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/10">
                <p className="text-xs text-muted-foreground px-4">
                  Nenhum link ativo para este exame. Os links gerados aparecerão listados aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {listagemCompartilhados.map((item: CompartilhamentoItem) => (
                  <div
                    key={item.idCompartilhamento}
                    className="flex items-center justify-between gap-2 border border-border bg-muted/20 rounded-lg p-2.5 text-xs"
                  >
                    <div className="space-y-1.5 truncate">
                      <p className="font-semibold text-foreground truncate">{item.medicoNome}</p>
                      <p className="text-muted-foreground text-[11px]">CRM: {item.medicoCrm}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.expiraEm ? `Até: ${new Date(item.expiraEm).toLocaleDateString('pt-BR')}` : 'Permanente'}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      title="Copiar Link Novamente"
                      onClick={() => {
                        navigator.clipboard.writeText(item.linkAcesso);
                        toast.success('Link copiado para transferência!');
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}