import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  orderControllerCreateOrder,
  orderControllerCancelTicket,
} from '@/_gen/api/tickets/sdk.gen'
import type { CreateOrderDto } from '@/_gen/api/tickets/types.gen'

const TENANT_ID = import.meta.env.VITE_TENANT_ID as string

export function useCreateOrder() {
  return useMutation({
    mutationFn: (body: CreateOrderDto) =>
      orderControllerCreateOrder({
        body,
        headers: { 'tenant-id': TENANT_ID },
      }),
    onError: () => {
      toast.error('Erro ao processar pedido. Tente novamente.')
    },
  })
}

export function useCancelTicket() {
  return useMutation({
    mutationFn: ({ orderId, ticketId }: { orderId: string; ticketId: string }) =>
      orderControllerCancelTicket({
        path: { orderId, ticketId },
        headers: { 'tenant-id': TENANT_ID },
      }),
    onSuccess: () => {
      toast.success('Solicitação de estorno enviada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao solicitar estorno. Tente novamente.')
    },
  })
}
