import { useGetMinhasSolicitacoesCpfCrm } from '../hooks/useGetMinhasSolicitacoesCpfCrm';
import SolicitacaoCard from './SolicitacaoCard';

const SolicitacoesMedico = () => {
  const { data: solicitacoes } = useGetMinhasSolicitacoesCpfCrm();
  return (
    <div className="flex flex-col gap-4">
      {solicitacoes?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Você ainda não fez nenhuma solicitação de alteração de dados.
        </p>
      )}
      {solicitacoes && solicitacoes.length > 0 ? (
        solicitacoes.map((solicitacao) => (
          <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} />
        ))
      ) : (
        <p className="text-muted-foreground">Nenhuma solicitação encontrada.</p>
      )}
    </div>
  );
};

export default SolicitacoesMedico;
