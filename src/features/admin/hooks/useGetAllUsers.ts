import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '../api/queryKeyrs';
import { getAllUsers } from '../api/getAllUsers';

export function useGetAllUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: getAllUsers,
  });
}
