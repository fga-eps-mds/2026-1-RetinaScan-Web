import { CardHistorico } from '../components/CardHistorico';

const HistoricoExame = () => {
  return (
    <div className="w-full flex justify-center flex-col gap-2 p-8 animate-in fade-in duration-500">
      <header className="text-center">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Exames
        </h2>
        <p className="text-md text-muted-foreground">
          Histórico completo de retinografias
        </p>
      </header>

      <div className="mt-8 pt-8 border-t border-border">
        <CardHistorico />
      </div>
    </div>
  );
};

export default HistoricoExame;
