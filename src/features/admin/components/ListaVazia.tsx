import { Inbox } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';

interface ListaVaziaProps {
  temFiltroAtivo: boolean;
}

export const ListaVazia = ({ temFiltroAtivo }: ListaVaziaProps) => (
  <TableRow className="hover:bg-transparent">
    <TableCell colSpan={7} className="py-16">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-full bg-slate-50 p-3 text-muted-foreground opacity-70">
          <Inbox className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-md font-semibold text-slate-900">
            {temFiltroAtivo ? 'Nenhum resultado encontrado' : 'Ainda não existem médicos registrados'}
          </p>
          <p className="text-xs text-muted-foreground">
            {temFiltroAtivo 
              ? 'Tente ajustar os critérios de busca para encontrar o profissional.' 
              : 'Assim que houver profissionais cadastrados, eles aparecerão aqui.'}
          </p>
        </div>
      </div>
    </TableCell>
  </TableRow>
);