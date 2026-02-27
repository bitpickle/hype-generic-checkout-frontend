import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CartReview } from '@/components/checkout/cart-review';
import { CheckoutResult } from '@/components/checkout/checkout-result';
import { GuestAuth } from '@/components/checkout/guest-auth';
import { PaymentMethod } from '@/components/checkout/payment-method';
import { TicketAssignment } from '@/components/checkout/ticket-assignment';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

export const Route = createFileRoute('/checkout')({
  component: RouteComponent,
});

function RouteComponent() {
  const [step, setStep] = useState<'cart' | 'auth' | 'tickets' | 'payment' | 'result'>('cart');
  const [resultStatus, setResultStatus] = useState<'success' | 'expired' | 'failed'>('success');
  const { isAuthenticated, user } = useAuthStore();
  const { cartId, items, createApiCart, clearCart } = useCartStore();
  const [ticketData, setTicketData] = useState<unknown>(null);

  // Create API cart if authenticated and cartId is null but items exist
  useEffect(() => {
    if (isAuthenticated && !cartId && items.length > 0) {
      createApiCart();
    }
  }, [isAuthenticated, cartId, items, createApiCart]);

  const handleCartNext = () => {
    if (isAuthenticated) {
      setStep('tickets');
    } else {
      setStep('auth');
    }
  };

  const handleAuthNext = () => {
    setStep('tickets');
  };

  const handleTicketsNext = (data: unknown) => {
    setTicketData(data);
    setStep('payment');
  };

  const handlePaymentNext = async (method: string) => {
    if (!cartId || !user) {
      // Fallback if something is wrong
      setResultStatus('failed');
      setStep('result');
      return;
    }

    try {
      // This is where we would call the actual backend API to complete the order.
      // For now, we simulate success as described in the comments.
      // In a real implementation:
      // 1. Fetch detailed cart to get real ticket IDs.
      // 2. Map user input to these IDs.
      // 3. Call orderControllerCreateOrder.

      console.log('Processing payment with method:', method);
      console.log('Order Data:', { cartId, ticketData });

      setResultStatus('success');
      clearCart();
      setStep('result');
    } catch (error) {
      console.error('Payment failed', error);
      setResultStatus('failed');
      setStep('result');
    }
  };

  const handleRetry = () => {
    setStep('cart');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
        {/* Progress Bar or Steps Indicator could go here */}
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span className={step === 'cart' ? 'font-bold text-primary' : ''}>Carrinho</span> &gt;
          <span className={step === 'auth' ? 'font-bold text-primary' : ''}>Identificação</span>{' '}
          &gt;
          <span className={step === 'tickets' ? 'font-bold text-primary' : ''}>Ingressos</span> &gt;
          <span className={step === 'payment' ? 'font-bold text-primary' : ''}>Pagamento</span>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        {step === 'cart' && <CartReview onNext={handleCartNext} />}
        {step === 'auth' && <GuestAuth onNext={handleAuthNext} />}
        {step === 'tickets' && <TicketAssignment onNext={handleTicketsNext} />}
        {step === 'payment' && <PaymentMethod onNext={handlePaymentNext} />}
        {step === 'result' && <CheckoutResult status={resultStatus} onRetry={handleRetry} />}
      </div>
    </div>
  );
}
