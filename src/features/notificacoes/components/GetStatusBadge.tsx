import { Clock3, CircleCheckBig, CircleX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function getStatusBadge(status: 'PENDENTE' | 'APROVADA' | 'REJEITADA') {
  switch (status) {
    case 'PENDENTE':
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100"
        >
          <Clock3 className="h-3.5 w-3.5" />
          Pendente
        </Badge>
      );

    case 'APROVADA':
      return (
        <Badge className="flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
          <CircleCheckBig className="h-3.5 w-3.5" />
          Aprovada
        </Badge>
      );

    case 'REJEITADA':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <CircleX className="h-3.5 w-3.5" />
          Rejeitada
        </Badge>
      );

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
