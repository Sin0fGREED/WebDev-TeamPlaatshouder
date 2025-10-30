import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';


export type UserDto = { id: string; name: string };


export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<UserDto[]>('/api/users')).data,
  });


export const useUser = (id: string) => useQuery({
  queryKey: ['users', id],
  queryFn: async () => (await api.get<UserDto>(`/api/users/${id}`)).data,
});
