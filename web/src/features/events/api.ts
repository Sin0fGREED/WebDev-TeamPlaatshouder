import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';


export type EventDto = { id: string; title: string; startUtc: string; endUtc: string; roomId?: string };


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
