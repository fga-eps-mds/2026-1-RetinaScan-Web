import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetricCardProps {
  title: string;
  value: number;
  subtext: string;
  variant?: 'default' | 'danger' | 'success' | 'info' | 'warning';
  tooltipInfo?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  variant = 'default',
  tooltipInfo,
}) => {
  // Mapeamento de estilos por variante (Design Tokens).
  // Centraliza a configuração visual, evitando condicionais complexas ou templates strings longas na renderização.
  const styles = {
    default: {
      card: 'bg-white border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50',
      title: 'text-muted-foreground group-hover:text-gray-900',
      value: 'text-foreground',
      subtext: 'text-muted-foreground group-hover:text-gray-700', 
    },
    danger: {
      card: 'bg-red-50 border-red-100 shadow-sm hover:border-red-200 hover:shadow-lg hover:shadow-red-500/15',
      title: 'text-red-900 group-hover:text-red-950', 
      value: 'text-red-700', 
      subtext: 'text-red-700 group-hover:text-red-800', 
    },
    success: {
      card: 'bg-green-50 border-green-100 shadow-sm hover:border-green-200 hover:shadow-lg hover:shadow-green-500/15',
      title: 'text-green-900 group-hover:text-green-950',
      value: 'text-green-700', 
      subtext: 'text-green-700 group-hover:text-green-800',
    },
    info: {
      card: 'bg-blue-50 border-blue-100 shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/15',
      title: 'text-blue-900 group-hover:text-blue-950', 
      value: 'text-blue-700', 
      subtext: 'text-blue-700 group-hover:text-blue-800', 
    },
    warning: {
      card: 'bg-amber-50 border-amber-200 shadow-sm hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/15',
      title: 'text-amber-900 group-hover:text-amber-950',
      value: 'text-amber-700',
      subtext: 'text-amber-800 group-hover:text-amber-900',
    },
  };
  return (
    // A classe 'group' permite coordenar animações nos elementos filhos quando o contêiner recebe hover.
    // 'transition-all' e 'hover:-translate-y-1' aplicam aceleração via GPU para micro-interações fluidas.
    <div
      className={`p-6 rounded-2xl border flex flex-col justify-between h-32 transition-all duration-300 hover:-translate-y-1 cursor-default group ${styles[variant].card}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium transition-colors duration-300 ${styles[variant].title}`}
        >
          {title}
        </span>

        {tooltipInfo && (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                {/* O button garante que o ícone seja acessível via navegação por teclado (Tab) */}
                <button
                  type="button"
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 transition-shadow"
                  aria-label={`Informação sobre ${title}`}
                >
                  <AlertCircle
                    className={`h-4 w-4 cursor-help transition-colors duration-300 ${styles[variant].title}`}
                  />
                </button>
              </TooltipTrigger>
              {/* side="bottom" e sideOffset evitam que o tooltip cubra o header ou fique espremido */}
              <TooltipContent
                side="bottom"
                sideOffset={8}
                className="max-w-63.75 text-center"
              >
                <p className="text-xs font-normal">{tooltipInfo}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="mt-2">
        <span
          className={`text-3xl font-bold transition-colors duration-300 ${styles[variant].value}`}
        >
          {value}
        </span>

        <p
          className={`text-xs mt-1 transition-colors duration-300 ${styles[variant].subtext}`}
        >
          {subtext}
        </p>
      </div>
    </div>
  );
};
