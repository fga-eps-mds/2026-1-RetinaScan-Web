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
  // Mapeamento de bag
  const styles = {
    default: {
      card: 'bg-white border-gray-100',
      value: 'text-gray-900',
    },
    danger: {
      card: 'bg-[#FFF5F5] border-[#FED7D7]',
      value: 'text-[#E53E3E]',
    },
    success: {
      card: 'bg-[#F0FDF4] border-[#DCFCE7]',
      value: 'text-[#16A34A]',
    },
    info: {
      card: 'bg-[#F0F4F8] border-[#D9E2EC]',
      value: 'text-[#334E68]',
    },
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between h-32 ${styles[variant].card}`}>
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className="mt-2">
        <span className={`text-3xl font-bold ${styles[variant].value}`}>{value}</span>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
};