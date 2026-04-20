import { AvatarImage, AvatarFallback, Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Eye,
  Plus,
  Users,
  LogOut,
  Pencil,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router';

const navItems = [
  {
    to: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
    allowed_roles: ['ADMIN', 'MEDICO'],
  },
  {
    to: '/exames/novo',
    icon: Plus,
    label: 'Novo exame',
    allowed_roles: ['ADMIN', 'MEDICO'],
  },
  {
    to: '/exames',
    icon: Eye,
    label: 'Exames',
    allowed_roles: ['ADMIN', 'MEDICO'],
  },
  {
    to: '/admin/controle-usuarios',
    icon: Users,
    label: 'Controle de usuários',
    allowed_roles: ['ADMIN'],
  },
];

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const userRole = session?.user?.tipoPerfil;

  const visibleNavItems = navItems.filter((item) => {
    if (!userRole) return false;
    return item.allowed_roles.includes(userRole);
  });

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate('/login');
        },
      },
    });
  };

  const imageUrl = session?.user?.image
    ? `${session.user.image.replace(
        'http://retina-scan-minio:9000',
        'http://localhost:9000'
      )}?t=${new Date().getTime()}`
    : '';

  return (
    <aside className="gradient-sidebar flex min-h-screen w-64 flex-col text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
        <div className="gradient-clinical flex h-9 w-9 items-center justify-center rounded-lg">
          <Eye className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>

        <div>
          <h1 className="font-heading text-sm font-bold text-sidebar-accent-foreground">
            RetinaScan
          </h1>
          <p className="text-[11px] text-sidebar-foreground/60">
            Triagem Inteligente
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNavItems.map((item) => {
          const active = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 space-y-1 border-t border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-2">
          <Avatar>
            {/* crossOrigin="anonymous" adicionado para não enviar os cookies gigantes do localhost */}
            <AvatarImage
              src={imageUrl}
              crossOrigin="anonymous"
              className="object-cover"
            />
            <AvatarFallback>
              {session?.user.name
                ? session.user.name.substring(0, 2).toUpperCase()
                : 'US'}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col overflow-hidden">
            <p className="truncate text-sm font-bold text-sidebar-foreground">
              {session?.user.name || 'Usuário'}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {session?.user.email}
            </p>
          </div>
          {session?.user.tipoPerfil === 'MEDICO' && (
            <div className="flex items-center justify-end ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate('/perfil/editar')}
              >
                <Pencil size={16} />
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default SideBar;
