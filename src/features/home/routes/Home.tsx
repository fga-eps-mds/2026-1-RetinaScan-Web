import { useSession } from '@/lib/auth-client';

const Home = () => {
  const { data: session } = useSession();
  console.log(session);
  return <div>Home</div>;
};

export default Home;
