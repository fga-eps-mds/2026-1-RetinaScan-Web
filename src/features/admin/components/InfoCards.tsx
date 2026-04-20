import { BadgeCheck, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const InfoCards = ({
  totalUsers,
  totalActiveUsers,
}: {
  totalUsers: number;
  totalActiveUsers: number;
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Card size="sm" className="w-35 h-20">
        <CardContent className="py-1">
          <p className="text-xl font-heading font-bold text-foreground flex items-center gap-1">
            <Users /> {totalUsers}
          </p>
          <p className="text-sm">Total de usuários</p>
        </CardContent>
      </Card>

      <Card size="sm" className="w-35 h-20 outline-green-500">
        <CardContent className="py-1">
          <p className="text-xl font-heading font-bold flex items-center gap-1 text-green-500">
            <BadgeCheck /> {totalActiveUsers}
          </p>
          <p className="text-sm text-green-700">Usuários ativos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoCards;
