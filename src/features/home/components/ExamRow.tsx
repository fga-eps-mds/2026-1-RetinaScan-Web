// home/components/RecentExamsTable.tsx
import React from 'react';
import type { RecentExamItem, DashboardExamStatusTag } from '../types/dashboard-result';

interface ExamRowProps {
  exams: RecentExamItem[];
  onViewAllClick?: () => void;
}

export const ExamRow: React.FC<ExamRowProps> = ({ exams, onViewAllClick }) => {
  
  const getTagStyles = (tag: DashboardExamStatusTag) => {
    switch (tag) {
      case 'PRIORIDADE':
        return 'bg-[#FFF5F5] text-[#E53E3E] font-medium';
      case 'NORMAL':
        return 'bg-[#F0FDF4] text-[#16A34A] font-medium';
      case 'PENDENTE':
        return 'bg-[#E2E8F0] text-[#64748B] font-medium';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full p-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Exames Recentes</h3>
        <button 
          onClick={onViewAllClick}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          Ver todos &rarr;
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {exams.map((exam) => (
          <div key={exam.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            
            {/* Info do Exame e Paciente */}
            <div>
              <span className="text-sm font-bold text-gray-900 block">{exam.id}</span>
              <span className="text-xs text-gray-400">
                {exam.pacienteID} - {exam.olho}
              </span>
            </div>

            {/* Score, Status e Data */}
            <div className="flex items-center gap-8 justify-between md:justify-end min-w-75">
              <div className="w-20 text-right">
                {exam.scoreIA !== null ? (
                  <span className={`text-sm font-bold ${exam.statusTag === 'PRIORIDADE' ? 'text-[#E53E3E]' : 'text-gray-700'}`}>
                    Score: {exam.scoreIA}
                  </span>
                ) : (
                  <span className="text-sm text-gray-300">—</span>
                )}
              </div>

              <div className="w-24 text-center">
                <span className={`text-xs px-3 py-1 rounded-full ${getTagStyles(exam.statusTag)}`}>
                  {exam.statusTag.charAt(0) + exam.statusTag.slice(1).toLowerCase()}
                </span>
              </div>

              <div className="w-24 text-right text-sm text-gray-600">
                {exam.dataExame}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};