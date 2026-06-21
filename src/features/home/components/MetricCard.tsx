import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  subtext: string;
  variant?: 'default' | 'danger' | 'success' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  variant = 'default',
}) => {
  // Mapeamento de estilos por variante (Design Tokens).
  // Centraliza a configuração visual, evitando condicionais complexas ou templates strings longas na renderização.
  const styles = {
    default: {
      card: 'bg-white border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50',
      title: 'text-muted-foreground group-hover:text-gray-600',
      value: 'text-foreground',
      subtext: 'text-muted-foreground/70 group-hover:text-muted-foreground',
    },
    danger: {
      card: 'bg-red-50 border-red-100 shadow-sm hover:border-red-200 hover:shadow-lg hover:shadow-red-500/15',
      title: 'text-red-700/80 group-hover:text-red-800',
      value: 'text-destructive',
      subtext: 'text-red-600/70',
    },
    success: {
      card: 'bg-green-50 border-green-100 shadow-sm hover:border-green-200 hover:shadow-lg hover:shadow-green-500/15',
      title: 'text-green-700/80 group-hover:text-green-800',
      value: 'text-clinical-success',
      subtext: 'text-green-600/70',
    },
    info: {
      card: 'bg-blue-50 border-blue-100 shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/15',
      title: 'text-blue-700/80 group-hover:text-blue-800',
      value: 'text-primary',
      subtext: 'text-blue-600/70',
    },
  };

  return (
    // A classe 'group' permite coordenar animações nos elementos filhos quando o contêiner recebe hover.
    // 'transition-all' e 'hover:-translate-y-1' aplicam aceleração via GPU para micro-interações fluidas.
    <div 
      className={`p-6 rounded-2xl border flex flex-col justify-between h-32 transition-all duration-300 hover:-translate-y-1 cursor-default group ${styles[variant].card}`}
    >
      <span className={`text-sm font-medium transition-colors duration-300 ${styles[variant].title}`}>
        {title}
      </span>
      
      <div className="mt-2">
        <span className={`text-3xl font-bold transition-colors duration-300 ${styles[variant].value}`}>
          {value}
        </span>
        
        <p className={`text-xs mt-1 transition-colors duration-300 ${styles[variant].subtext}`}>
          {subtext}
        </p>
      </div>
    </div>
  );
};