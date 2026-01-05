import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';


export type UserDto = { id: string; name: string; email: string; role: string; status: string; };


export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<UserDto[]>('/api/users?search=')).data,
  });


export const useUsersQuery = (search: string) =>
  useQuery({
    queryKey: ['users', search],
    queryFn: async () => (await api.get<UserDto[]>('/api/users', { params: { search } })).data,
    staleTime: 60_000,
  });


export const useUser = (id: string) => useQuery({
  queryKey: ['users', id],
  queryFn: async () => (await api.get<UserDto>(`/api/users/${id}`)).data,
});
