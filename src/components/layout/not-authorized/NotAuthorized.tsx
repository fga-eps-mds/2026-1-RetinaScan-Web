import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Acesso não autorizado
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Você está autenticado, mas não tem permissão para acessar esta
            página.
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Button
            type="button"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Ir para dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
