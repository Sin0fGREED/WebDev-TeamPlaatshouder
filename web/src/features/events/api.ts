import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { UserDto } from '../presence/api';

export type EmployeeDto = { id: string; role: string; userId: string; user: UserDto; }
export type AttendeeDto = { id: string; eventId: string; event: EventDto; employeeId: string; employee: EmployeeDto; response: string };
export type EventDto = { id: string; title: string; startUtc: string; endUtc: string; roomId?: string; attendees: AttendeeDto[] };


export const useEvents = (from: string, to: string) =>
  useQuery({
    queryKey: ['events', from, to],
    queryFn: async () => (await api.get<EventDto[]>('/api/events', { params: { from, to } })).data,
  });


export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<EventDto, 'id'>) => api.post('/api/events', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useEvent = (id: string) => useQuery({
  queryKey: ['event', id],
  queryFn: async () => (await api.get<EventDto>(`/api/events/${id}`)).data,
});
