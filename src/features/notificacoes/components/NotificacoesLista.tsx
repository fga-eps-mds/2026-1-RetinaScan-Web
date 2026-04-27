import { NotificationCard } from './NotificacoesCard';

export function NotificationsList() {
  const notifications = [
    {
      id: 1,
      type: 'urgent' as const,
      title: 'Exame com alta prioridade detectado',
      description: 'Paciente Maria S. - suspeita de anomalia',
      time: 'Há 5 min',
    },
    {
      id: 2,
      type: 'success' as const,
      title: 'Laudo Aprovado',
      description: 'Paciente João D. - Laudo aprovado pelo Dr. Silva',
      time: 'Há 15 min',
    },
  ];

  return (
    <div className="space-y-4">
      {notifications.map((n) => (
        <NotificationCard key={n.id} {...n} />
      ))}
    </div>
  );
}
