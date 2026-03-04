import { useQuery } from '@tanstack/react-query'
import { ticketControllerGetUserTickets } from '@/_gen/api/tickets/sdk.gen'
import { useAuthStore } from '@/stores/auth.store'

const TENANT_ID = import.meta.env.VITE_TENANT_ID as string

export function useUserTickets() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['userTickets'],
    queryFn: async () => {
      const result = await ticketControllerGetUserTickets({
        headers: { 'tenant-id': TENANT_ID },
      })
      if (result.data) return result.data
      throw new Error('Erro ao buscar ingressos')
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  })
}
