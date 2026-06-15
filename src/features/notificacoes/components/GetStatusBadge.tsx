import {
  Clock3,
  CircleCheckBig,
  CircleX,
  Mail,
  OctagonAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type InscricaoStatus =
  | 'PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'CONVITE_ENVIADO'
  | 'EXPIRADA';

export function getStatusBadge(status: InscricaoStatus) {
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

    case 'CONVITE_ENVIADO':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50"
        >
          <Mail className="h-3.5 w-3.5" />
          Convite enviado
        </Badge>
      );

    case 'EXPIRADA':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50"
        >
          <OctagonAlert className="h-3.5 w-3.5" />
          Expirada
        </Badge>
      );
  }
}
