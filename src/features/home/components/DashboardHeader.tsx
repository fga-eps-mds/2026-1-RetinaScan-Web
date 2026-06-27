import React from 'react';

interface DashboardHeaderProps {
  userName: string;
  badgeText: string;
  subtitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  badgeText,
  subtitle,
}) => {
  return (
    <header className="space-y-2">
      {/* Badge dinâmica */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
          {badgeText}
        </span>
      </div>
      
      {/* Saudação com o nome */}
      <h2 className="text-4xl font-heading font-bold text-foreground sm:text-3xl">
        Seja bem-vindo(a), <span className="text-primary">{userName}</span> 
      </h2>
      
      {/* Subtítulo dinâmico */}
      <p className="text-md text-muted-foreground">
        {subtitle}
      </p>
    </header>
  );
};