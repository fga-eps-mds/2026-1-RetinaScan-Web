import { CardHistorico } from '../components/CardHistorico';

const HistoricoExame = () => {
  return (
    <div className="w-full p-8">
      <header className="text-center">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Exames
        </h2>
        <p className="text-md text-muted-foreground">
          Histórico completo de retinografias        
        </p>
      </header>
      <div className="flex items-center justify-center gap-16 border-t border-border mt-8 pt-8">
        <CardHistorico>
          
        </CardHistorico>
      </div>
    </div>
  );
};

export default HistoricoExame;
