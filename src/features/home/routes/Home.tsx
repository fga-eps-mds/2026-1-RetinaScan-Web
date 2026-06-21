// src/features/home/routes/Home.tsx
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';

export const Home = () => {
  // Busca a sessão atual usando o client do better-auth
  const { data: session, isPending } = authClient.useSession();

  // Enquanto verifica quem é o usuário, exibe um loading centralizado
  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Extrai o tipoPerfil do usuário logado
  const tipoPerfil = session?.user?.tipoPerfil;

  // Direciona para a View correta
  if (tipoPerfil === 'ADMIN') {
    return <AdminDashboard />; // fazer um mapemento de tipoPerfil para componentes, caso tenhamos mais de um tipo de usuário no futuro /mapear uma string para mapear o componente, para evitar muitos ifs ou switchs no futuro
  }



  // Fallback de segurança: se o perfil vier vazio ou for desconhecido
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-gray-500 font-medium">Perfil de usuário não autorizado ou não reconhecido.</p>
    </div>
  );
};

export default Home;