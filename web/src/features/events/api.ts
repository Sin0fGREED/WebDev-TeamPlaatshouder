import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { UserDto } from '../presence/api';

//export type AttendeeResponse = "Pending" | "Accepted" | "Declined" | "Tentative";
export type AttendeeResponse = 0 | 1 | 2 | 3;
export type AttendeeDto = {
  userId: string;
  email: string;
  response: AttendeeResponse; // or number temporarily
};

export type EventDto = {
  id: string;
  title: string;
  startUtc: string;
  endUtc: string;
  roomId?: string;
  attendees: AttendeeDto[];
};

export type CreateAttendeeDto = { userId: string };
export type CreateEventDto = {
  title: string;
  startUtc: string;
  endUtc: string;
  roomId?: string;
  attendees: CreateAttendeeDto[];
};

export const useEvents = (from: string, to: string) =>
  useQuery({
    queryKey: ['events', from, to],
    queryFn: async () => (await api.get<EventDto[]>('/api/events', { params: { from, to } })).data,
  });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventDto) => api.post('/api/events', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useEvent = (id: string) => useQuery({
  queryKey: ['event', id],
  queryFn: async () => (await api.get<EventDto>(`/api/events/${id}`)).data,
});
