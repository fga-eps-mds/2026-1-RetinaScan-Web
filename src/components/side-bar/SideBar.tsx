import { authClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Eye,
  Plus,
  ListOrdered,
  Users,
  LogOut,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/exames', icon: Eye, label: 'Exames' },
  { to: '/exames/novo', icon: Plus, label: 'Novo Exame' },
  { to: '/fila', icon: ListOrdered, label: 'Fila de Prioridade' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
];

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  console.log('Session data:', session);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate('/login');
        },
      },
    });
  };

  return (
    <aside className="gradient-sidebar w-64 min-h-screen flex flex-col text-sidebar-foreground">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-clinical flex items-center justify-center">
          <Eye className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-sm text-sidebar-accent-foreground">
            RetinaScan
          </h1>
          <p className="text-[11px] text-sidebar-foreground/60">
            Triagem Inteligente
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 px-3 py-4 border-t border-sidebar-border space-y-1">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>
              {session?.user.name
                ? session.user.name.substring(0, 2).toUpperCase()
                : 'US'}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-sidebar-foreground">
              {session?.user.name || 'Usuário'}
            </p>
            <p className="text-xs">{session?.user.email}</p>
          </div>
        </div>

        <Button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-bold text-white hover:text-destructive w-full transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default SideBar;
