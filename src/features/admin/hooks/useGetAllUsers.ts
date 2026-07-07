import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '../api/queryKeyrs';
import { getAllUsers } from '../api/getAllUsers';

// Hook personalizado para obter todos os usuários do sistema
export function useGetAllUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: getAllUsers,
  });
}
