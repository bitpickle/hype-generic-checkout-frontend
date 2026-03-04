import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle2, Clock, RefreshCw, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { CouponInput } from '@/components/checkout/coupon-input';
import { OrderSummary } from '@/components/checkout/order-summary';
import { PaymentForm } from '@/components/checkout/payment-form';
import { TicketForm } from '@/components/checkout/ticket-form';
import { CountdownTimer } from '@/components/countdown-timer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-auth';
import { useApplyCoupon, useCancelCart, useCart, useCreateCart } from '@/hooks/use-cart';
import { useCreateOrder } from '@/hooks/use-order';
import { formatCurrency } from '@/lib/format';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useCheckoutStore } from '@/stores/checkout.store';

export const Route = createFileRoute('/_main/checkout')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: '/checkout' } });
    }
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const { user } = useAuthStore();
  const effectiveUser = currentUserData ?? user;

  const {
    step,
    cart: checkoutCart,
    currentTicketIndex,
    ticketsData,
    paymentMethod,
    setStep,
    setCart,
    setTicketData,
    setOrder,
    nextTicket,
    prevTicket,
    resetCheckout,
  } = useCheckoutStore();

  const {
    event: localCartEvent,
    items: localCartItems,
    clearCart,
    getTotalQuantity,
  } = useCartStore();
  const createCart = useCreateCart();
  const cancelCart = useCancelCart();
  const createOrder = useCreateOrder();

  // cart ID persisted in checkoutCart
  const cartId = checkoutCart?.id ?? null;
  const { data: cartData, isLoading: cartLoading } = useCart(cartId);

  // Keep checkout store cart in sync with live cart data
  useEffect(() => {
    if (cartData) {
      setCart(cartData);
      if (cartData.status === 'expired' || cartData.status === 'cancelled') {
        setStep('expired');
      }
    }
  }, [cartData]);

  // If no local cart items and we're on cart step, redirect home
  useEffect(() => {
    if (step === 'cart' && getTotalQuantity() === 0 && !checkoutCart) {
      navigate({ to: '/' });
    }
  }, []);

  const applyCoupon = useApplyCoupon(cartId ?? '');

  // -------------------- Cart step -------------------
  async function handleProceedFromCart() {
    if (!localCartItems.length) return;

    const cartTickets = localCartItems.map((item) => ({
      batchId: item.batchId,
      quantity: item.quantity,
    }));

    const result = await createCart.mutateAsync({ tickets: cartTickets });
    if (result.data) {
      // Fetch detailed cart
      setCart({
        ...result.data,
        tickets: [],
        coupon: null,
        originalTotal: 0,
        totalServiceFee: 0,
        finalTotal: 0,
        discountAmount: 0,
      } as never);
      // The useCart hook will load full data
      setStep('ticket-data');
    }
  }

  // -------------------- Ticket step -------------------
  function handleTicketSubmit(data: (typeof ticketsData)[0]) {
    setTicketData(currentTicketIndex, data);
    nextTicket();
  }

  // -------------------- Payment step -------------------
  async function handlePaymentSubmit(method: 'credit_card' | 'pix') {
    if (!checkoutCart) return;
    setStep('processing');

    const orderTickets = checkoutCart.tickets.map((t, i) => {
      const td = ticketsData[i];
      return {
        ticketId: t.id,
        firstName: td?.firstName ?? '',
        lastName: td?.lastName ?? '',
        email: td?.email ?? '',
        responses: td?.responses ?? [],
      };
    });

    const firstTicket = ticketsData[0];
    const result = await createOrder.mutateAsync({
      cartId: checkoutCart.id,
      firstName: firstTicket?.firstName ?? '',
      lastName: firstTicket?.lastName ?? '',
      email: firstTicket?.email ?? '',
      tickets: orderTickets,
    });

    if (result.data) {
      setOrder(result.data);
      clearCart();
      setStep('success');
    } else {
      setStep('payment');
    }
  }

  // -------------------- Back from ticket-data (cancels backend cart) -------------------
  function handleBackFromTicketData() {
    if (currentTicketIndex > 0) {
      prevTicket();
    } else {
      // Going back to cart review — cancel the backend cart
      if (cartId) cancelCart.mutate(cartId);
      resetCheckout();
    }
  }

  // -------------------- Expired / Cancel -------------------
  function handleRestartCheckout() {
    if (cartId) cancelCart.mutate(cartId);
    resetCheckout();
    navigate({ to: '/' });
  }

  // -------------------- Render -------------------
  return (
    <div className="flex flex-col min-h-svh bg-background">
      <AnimatePresence mode="wait">
        {step === 'cart' && (
          <CartStep
            key="cart"
            localCartEvent={localCartEvent}
            localCartItems={localCartItems}
            onProceed={handleProceedFromCart}
            isLoading={createCart.isPending}
            onBack={() => {
              if (localCartEvent) {
                navigate({ to: '/event/$eventId', params: { eventId: localCartEvent.id } });
              } else {
                navigate({ to: '/' });
              }
            }}
          />
        )}

        {step === 'ticket-data' && checkoutCart && (
          <TicketDataStep
            key="ticket-data"
            cart={checkoutCart}
            currentIndex={currentTicketIndex}
            ticketsData={ticketsData}
            user={effectiveUser ?? null}
            onSubmit={handleTicketSubmit}
            onBack={handleBackFromTicketData}
          />
        )}

        {step === 'ticket-data' && !checkoutCart && cartLoading && (
          <CheckoutSkeleton key="loading" />
        )}

        {step === 'payment' && checkoutCart && (
          <PaymentStep
            key="payment"
            cart={checkoutCart}
            cartId={checkoutCart.id}
            onSubmit={handlePaymentSubmit}
            onBack={() => setStep('ticket-data')}
            isLoading={createOrder.isPending}
            onCouponApply={(code) => applyCoupon.mutate(code)}
            onCouponRemove={() => applyCoupon.mutate(null)}
            isCouponLoading={applyCoupon.isPending}
            onExpire={() => setStep('expired')}
          />
        )}

        {step === 'processing' && <ProcessingStep key="processing" />}

        {step === 'success' && (
          <SuccessStep
            key="success"
            onGoToWallet={() => {
              resetCheckout();
              navigate({ to: '/wallet' });
            }}
          />
        )}

        {step === 'expired' && <ExpiredStep key="expired" onRestart={handleRestartCheckout} />}
      </AnimatePresence>
    </div>
  );
}

// ==================== STEP COMPONENTS ====================

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex flex-col flex-1 min-h-svh"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function StepHeader({
  title,
  onBack,
  expiresAt,
  onExpire,
}: {
  title: string;
  onBack?: () => void;
  expiresAt?: string;
  onExpire?: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center gap-3">
      {onBack && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="rounded-full shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Button>
      )}
      <span className="flex-1 text-base font-semibold text-foreground font-body">{title}</span>
      {expiresAt && <CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />}
    </div>
  );
}

// ---------- Cart Step ----------
function CartStep({
  localCartEvent,
  localCartItems,
  onProceed,
  isLoading,
  onBack,
}: {
  localCartEvent: ReturnType<typeof useCartStore>['event'];
  localCartItems: ReturnType<typeof useCartStore>['items'];
  onProceed: () => void;
  isLoading: boolean;
  onBack: () => void;
}) {
  const totalQty = localCartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = localCartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const serviceFee = localCartItems.reduce((acc, i) => {
    if (!localCartEvent || localCartEvent.isServiceFeeIncluded) return acc;
    const fee = i.serviceFee ?? i.price * localCartEvent.serviceFeeRate;
    return acc + fee * i.quantity;
  }, 0);
  const total = subtotal + serviceFee;

  return (
    <StepWrapper>
      <StepHeader title="Carrinho" onBack={onBack} />

      <div className="flex flex-col flex-1 px-5 py-5 gap-5 pb-36">
        {localCartEvent && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary border border-border">
            <div
              className="w-10 h-10 rounded-lg bg-muted bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url(${localCartEvent.bannerImage})` }}
            />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground font-body truncate">
                {localCartEvent.name}
              </span>
              <span className="text-xs text-muted-foreground font-body">
                {localCartEvent.venueCity}, {localCartEvent.venueState}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {localCartItems.map((item) => (
            <div
              key={item.batchId}
              className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-base font-semibold text-foreground font-body">
                  {item.batchName || 'Ingresso'}
                </span>
                <span className="text-sm text-muted-foreground font-body">{item.sectionName}</span>
                <span className="text-xs text-muted-foreground font-body">
                  {item.quantity}x {formatCurrency(item.price)}
                </span>
              </div>
              <span className="text-base font-bold text-brand font-body shrink-0 ml-2">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-body">
              Subtotal ({totalQty} ingresso{totalQty !== 1 ? 's' : ''})
            </span>
            <span className="text-sm font-medium text-foreground font-body">
              {formatCurrency(subtotal)}
            </span>
          </div>
          {serviceFee > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-body">Taxa de serviço</span>
              <span className="text-sm font-medium text-foreground font-body">
                {formatCurrency(serviceFee)}
              </span>
            </div>
          )}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground font-body">Total</span>
            <span className="text-lg font-bold text-brand font-display">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 max-w-[480px] mx-auto px-5 pb-6 pt-3 bg-background/95 backdrop-blur-md border-t border-border">
        <Button
          onClick={onProceed}
          disabled={isLoading || localCartItems.length === 0}
          className="w-full h-14 rounded-2xl text-base font-semibold font-body"
        >
          {isLoading ? 'Aguarde...' : `Comprar · ${formatCurrency(total)}`}
        </Button>
      </div>
    </StepWrapper>
  );
}

// ---------- Ticket Data Step ----------
function TicketDataStep({
  cart,
  currentIndex,
  ticketsData,
  user,
  onSubmit,
  onBack,
}: {
  cart: NonNullable<ReturnType<typeof useCheckoutStore>['cart']>;
  currentIndex: number;
  ticketsData: ReturnType<typeof useCheckoutStore>['ticketsData'];
  user: import('@/_gen/api/auth/types.gen').UserDataResponseDto | null;
  onSubmit: (data: (typeof ticketsData)[0]) => void;
  onBack: () => void;
}) {
  const ticket = cart.tickets[currentIndex];
  if (!ticket) return null;

  const currentData = ticketsData[currentIndex] ?? {
    ticketId: ticket.id,
    firstName: '',
    lastName: '',
    email: '',
    cpf: '',
    phone: '',
    responses: [],
  };

  return (
    <StepWrapper>
      <StepHeader title="Dados do ingresso" onBack={onBack} expiresAt={cart.expiresAt} />

      <div className="flex flex-col flex-1 px-5 py-5 pb-36">
        <TicketForm
          ticket={ticket}
          ticketIndex={currentIndex}
          totalTickets={cart.tickets.length}
          currentData={currentData}
          user={user}
          onSubmit={onSubmit}
          submitLabel={currentIndex === cart.tickets.length - 1 ? 'Ir para pagamento' : 'Próximo'}
        />
      </div>

      <div className="fixed bottom-0 inset-x-0 max-w-[480px] mx-auto px-5 pb-6 pt-3 bg-background/95 backdrop-blur-md border-t border-border">
        <Button
          form="ticket-form"
          type="submit"
          className="w-full h-14 rounded-2xl text-base font-semibold font-body"
        >
          {currentIndex === cart.tickets.length - 1 ? 'Ir para pagamento' : 'Próximo'}
        </Button>
      </div>
    </StepWrapper>
  );
}

// ---------- Payment Step ----------
function PaymentStep({
  cart,
  cartId,
  onSubmit,
  onBack,
  isLoading,
  onCouponApply,
  onCouponRemove,
  isCouponLoading,
  onExpire,
}: {
  cart: NonNullable<ReturnType<typeof useCheckoutStore>['cart']>;
  cartId: string;
  onSubmit: (method: 'credit_card' | 'pix') => void;
  onBack: () => void;
  isLoading: boolean;
  onCouponApply: (code: string) => void;
  onCouponRemove: () => void;
  isCouponLoading: boolean;
  onExpire: () => void;
}) {
  const { paymentMethod } = useCheckoutStore();

  return (
    <StepWrapper>
      <StepHeader
        title="Pagamento"
        onBack={onBack}
        expiresAt={cart.expiresAt}
        onExpire={onExpire}
      />

      <div className="flex flex-col flex-1 px-5 py-5 pb-36 gap-5">
        <OrderSummary cart={cart} />

        <CouponInput
          appliedCoupon={cart.coupon}
          onApply={onCouponApply}
          onRemove={onCouponRemove}
          isLoading={isCouponLoading}
        />

        <PaymentForm cart={cart} onSubmit={onSubmit} isLoading={isLoading} />
      </div>

      <div className="fixed bottom-0 inset-x-0 max-w-[480px] mx-auto px-5 pb-6 pt-3 bg-background/95 backdrop-blur-md border-t border-border">
        <Button
          form="payment-form"
          type={paymentMethod === 'credit_card' ? 'submit' : 'button'}
          onClick={paymentMethod === 'pix' ? () => onSubmit('pix') : undefined}
          disabled={isLoading}
          className="w-full h-14 rounded-2xl text-base font-semibold font-body"
        >
          {isLoading
            ? 'Processando...'
            : `Confirmar pagamento · ${formatCurrency(cart.finalTotal)}`}
        </Button>
      </div>
    </StepWrapper>
  );
}

// ---------- Processing Step ----------
function ProcessingStep() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-svh gap-6 px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-brand border-t-transparent"
      />
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-foreground font-display">Processando pagamento</h2>
        <p className="text-muted-foreground font-body text-sm">
          Aguarde enquanto confirmamos sua compra...
        </p>
      </div>
    </motion.div>
  );
}

// ---------- Success Step ----------
function SuccessStep({ onGoToWallet }: { onGoToWallet: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-svh gap-6 px-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-success-subtle flex items-center justify-center"
      >
        <CheckCircle2 size={40} className="text-success" />
      </motion.div>

      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-foreground font-display">Pagamento confirmado!</h2>
        <p className="text-muted-foreground font-body text-sm leading-relaxed">
          Seus ingressos foram adquiridos com sucesso. Acesse sua carteira para ver os detalhes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <Button
          onClick={onGoToWallet}
          className="w-full h-14 rounded-2xl text-base font-semibold font-body"
        >
          <ShoppingBag size={18} className="mr-2" />
          Ver meus ingressos
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ---------- Expired Step ----------
function ExpiredStep({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-svh gap-6 px-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-warning-subtle flex items-center justify-center"
      >
        <Clock size={40} className="text-warning-foreground" />
      </motion.div>

      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-foreground font-display">Pedido expirado</h2>
        <p className="text-muted-foreground font-body text-sm leading-relaxed">
          O tempo para finalizar sua compra expirou. Volte ao evento e tente novamente.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <Button
          onClick={onRestart}
          variant="outline"
          className="w-full h-14 rounded-2xl text-base font-semibold font-body"
        >
          <RefreshCw size={18} className="mr-2" />
          Selecionar ingressos novamente
        </Button>
      </motion.div>
    </motion.div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="flex flex-col min-h-svh">
      <div className="h-16 border-b border-border px-5 flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  );
}
