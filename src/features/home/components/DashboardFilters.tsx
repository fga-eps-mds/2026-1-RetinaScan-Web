import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react'; 

interface DashboardFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
}) => {
  return (
    <div className="flex flex-row gap-3 w-full justify-end items-center my-6 px-8">
      {/* Filtro por Prioridade */}
      <div className="relative w-full md:w-72">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 pr-10 text-sm text-gray-600 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="">Filtrar por prioridade</option>
          <option value="PRIORIDADE">Prioridade</option>
          <option value="NORMAL">Normal</option>
          <option value="PENDENTE">Pendente</option>
        </select>
        <SlidersHorizontal className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Busca */}
      <div className="relative w-full md:w-96">
        <input
          type="text"
          placeholder="Buscar exame ou paciente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-blue-500"
        />
        <Search className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};