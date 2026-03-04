import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  cartControllerApplyCoupon,
  cartControllerCancelCart,
  cartControllerCreateCart,
  cartControllerGetActiveCart,
  cartControllerGetCart,
} from '@/_gen/api/tickets/sdk.gen';
import type { CreateCartDto } from '@/_gen/api/tickets/types.gen';

const TENANT_ID = import.meta.env.VITE_TENANT_ID as string;

export function useCreateCart() {
  return useMutation({
    mutationFn: (body: CreateCartDto) =>
      cartControllerCreateCart({
        body,
        headers: { 'tenant-id': TENANT_ID },
      }),
    onError: () => {
      toast.error('Erro ao criar carrinho. Tente novamente.');
    },
  });
}

export function useCart(cartId: string | null) {
  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: async () => {
      if (!cartId) throw new Error('No cart ID');
      const result = await cartControllerGetCart({
        path: { id: cartId },
        headers: { 'tenant-id': TENANT_ID },
      });
      if (result.data) return result.data;
      throw new Error('Erro ao carregar carrinho');
    },
    enabled: Boolean(cartId),
    refetchInterval: (query) => {
      // Stop polling if cart is in terminal state
      const data = query.state.data;
      if (
        data?.status === 'expired' ||
        data?.status === 'confirmed' ||
        data?.status === 'cancelled'
      ) {
        return false;
      }
      return 30 * 1000; // poll every 30s to check expiry
    },
    staleTime: 0,
  });
}

export function useActiveCart(enabled: boolean) {
  return useQuery({
    queryKey: ['cart', 'active'],
    queryFn: async () => {
      const result = await cartControllerGetActiveCart({
        headers: { 'tenant-id': TENANT_ID },
      });
      return result.data ?? null;
    },
    enabled,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useCancelCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartId: string) =>
      cartControllerCancelCart({
        path: { id: cartId },
        headers: { 'tenant-id': TENANT_ID },
      }),
    onSuccess: (_, cartId) => {
      queryClient.removeQueries({ queryKey: ['cart', cartId] });
      queryClient.setQueryData(['cart', 'active'], null);
    },
  });
}

export function useApplyCoupon(cartId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponCode: string | null) =>
      cartControllerApplyCoupon({
        path: { id: cartId },
        body: { couponCode },
        headers: { 'tenant-id': TENANT_ID },
      }),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.setQueryData(['cart', cartId], result.data);
        if (result.data.coupon) {
          toast.success('Cupom aplicado com sucesso!');
        } else {
          toast.info('Cupom removido.');
        }
      }
    },
    onError: () => {
      toast.error('Cupom inválido ou expirado.');
    },
  });
}
