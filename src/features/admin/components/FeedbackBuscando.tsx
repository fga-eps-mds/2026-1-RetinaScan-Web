import { RefreshCcw } from 'lucide-react';

interface FeedbackBuscandoProps {
  isTyping: boolean;
}

export const FeedbackBuscando = ({ isTyping }: FeedbackBuscandoProps) => (
  <div className="px-6 pb-4 flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in">
    <RefreshCcw className="h-4 w-4 animate-spin" />
    <span>{isTyping ? 'Buscando...' : 'Atualizando resultados...'}</span>
  </div>
);