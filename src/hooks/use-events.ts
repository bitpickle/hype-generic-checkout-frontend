import { useQuery } from '@tanstack/react-query';
import {
  eventControllerFindOne,
  eventControllerSearchAllPaginated,
} from '@/_gen/api/tickets/sdk.gen';

const TENANT_ID = import.meta.env.VITE_TENANT_ID as string;

export function useEvent(eventId: string) {
  console.log('Fetching event with ID:', eventId); // Debug log to check eventId value
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const result = await eventControllerFindOne({
        path: { id: eventId },
        headers: { 'tenant-id': TENANT_ID },
      });
      if (result.data) return result.data;
      throw new Error('Evento não encontrado');
    },
    enabled: Boolean(eventId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchEvents(search?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['events', search, limit, offset],
    queryFn: async () => {
      const result = await eventControllerSearchAllPaginated({
        query: { search, limit, offset },
        headers: { 'tenant-id': TENANT_ID },
      });
      if (result.data) return result.data;
      throw new Error('Erro ao buscar eventos');
    },
    staleTime: 2 * 60 * 1000,
  });
}
