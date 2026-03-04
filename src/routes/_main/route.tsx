import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useActiveCart, useCancelCart } from '@/hooks/use-cart';
import { useAuthStore } from '@/stores/auth.store';
import { useCheckoutStore } from '@/stores/checkout.store';

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated } = useAuthStore();
  const { cart: checkoutCart, setCart, setStep, resetCheckout } = useCheckoutStore();
  const navigate = useNavigate();
  // Only fetch active cart when: authenticated and not already mid-checkout (checkoutCart set)
  const { data: activeCart } = useActiveCart(isAuthenticated && !checkoutCart);
  const cancelCart = useCancelCart();

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (activeCart && (activeCart.status === 'created' || activeCart.status === 'checkout')) {
      setShowDialog(true);
    }
  }, [activeCart]);

  function handleContinue() {
    if (!activeCart) return;
    setCart(activeCart);
    setStep('ticket-data');
    setShowDialog(false);
    navigate({ to: '/checkout' });
  }

  function handleCancel() {
    if (!activeCart) return;
    cancelCart.mutate(activeCart.id);
    resetCheckout();
    setShowDialog(false);
  }

  return (
    <>
      <AlertDialog open={showDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mb-2">
              <ShoppingCart size={26} className="text-brand" />
            </div>
            <AlertDialogTitle className="font-display text-lg">
              Compra em andamento
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-center">
              Você tem uma compra não finalizada. Deseja continuar de onde parou ou cancelá-la?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleContinue}
              className="w-full h-12 rounded-xl font-body font-semibold"
            >
              Continuar compra
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelCart.isPending}
              className="w-full h-12 rounded-xl font-body"
            >
              {cancelCart.isPending ? 'Cancelando...' : 'Cancelar compra'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Outlet />
    </>
  );
}
