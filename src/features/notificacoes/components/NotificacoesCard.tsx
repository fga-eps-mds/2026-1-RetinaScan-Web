import { AlertTriangle, Info, CheckCircle, User, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

type NotificationType = 'urgent' | 'info' | 'success' | 'system';

const iconMap: Record<NotificationType, JSX.Element> = {
  urgent: <AlertTriangle className="text-red-500" />,
  info: <Info className="text-blue-500" />,
  success: <CheckCircle className="text-green-500" />,
  system: <User className="text-gray-500" />,
};
const tagMap: Record<NotificationType, JSX.Element> = {
  urgent: (
    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
      Urgente
    </span>
  ),
  info: (
    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
      Informação
    </span>
  ),
  success: (
    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
      Sucesso
    </span>
  ),
  system: (
    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
      Sistema
    </span>
  ),
};

type NotificationCardProps = {
  type: NotificationType;
  title: string;
  description: string;
  time: string;
};

export function NotificationCard({
  type,
  title,
  description,
  time,
}: NotificationCardProps) {
  return (
    <div className="flex items-start justify-between p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
      <div className="flex gap-4 items-start">
        <div className="p-5 rounded-full bg-muted">{iconMap[type]}</div>

        <div className="space-y-1">
          <p className="font-medium">
            {title} {tagMap[type]}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>

          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500">
            <Trash2 size={17} />
            Remover
          </button>
        </div>
      </div>

      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}
