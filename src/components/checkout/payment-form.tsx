import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, QrCode, Lock } from 'lucide-react'
import { formatCurrency, formatCardNumber, formatCardExpiry } from '@/lib/format'
import type { GetDetailedCartDto } from '@/_gen/api/tickets/types.gen'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCheckoutStore } from '@/stores/checkout.store'

const cardSchema = z.object({
  cardNumber: z.string().min(19, 'Número do cartão inválido'),
  cardExpiry: z.string().min(5, 'Validade inválida'),
  cardCvv: z.string().min(3, 'CVV inválido').max(4),
  cardName: z.string().min(3, 'Nome obrigatório'),
  cardCpf: z.string().min(14, 'CPF inválido'),
  installments: z.string().min(1, 'Selecione as parcelas'),
})

type CardValues = z.infer<typeof cardSchema>

interface PaymentFormProps {
  cart: GetDetailedCartDto
  onSubmit: (paymentMethod: 'credit_card' | 'pix') => void
  isLoading?: boolean
}

const INSTALLMENT_OPTIONS = [1, 2, 3, 6, 12]

export function PaymentForm({ cart, onSubmit, isLoading }: PaymentFormProps) {
  const { paymentMethod, setPaymentMethod } = useCheckoutStore()

  const form = useForm<CardValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardName: '',
      cardCpf: '',
      installments: '1',
    },
  })

  const handleCardSubmit = form.handleSubmit(() => {
    onSubmit('credit_card')
  })

  const handlePixSubmit = () => {
    onSubmit('pix')
  }

  const perInstallment = (n: number) =>
    formatCurrency(Math.ceil(cart.finalTotal / n))

  return (
    <div className="flex flex-col gap-6">
      {/* Total */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
        <span className="text-sm font-medium text-muted-foreground font-body">Total a pagar</span>
        <span className="text-xl font-bold text-brand font-display">
          {formatCurrency(cart.finalTotal)}
        </span>
      </div>

      {/* Method selector */}
      <div className="flex flex-col gap-2">
        <span className="text-lg font-bold text-foreground font-display">Forma de pagamento</span>
        <div className="grid grid-cols-2 gap-3">
          <MethodButton
            active={paymentMethod === 'credit_card'}
            onClick={() => setPaymentMethod('credit_card')}
            icon={<CreditCard size={22} />}
            label="Cartão"
          />
          <MethodButton
            active={paymentMethod === 'pix'}
            onClick={() => setPaymentMethod('pix')}
            icon={<QrCode size={22} />}
            label="PIX"
          />
        </div>
      </div>

      {/* Card form */}
      {paymentMethod === 'credit_card' && (
        <form onSubmit={handleCardSubmit} id="payment-form" className="flex flex-col gap-3">
          <FormField label="Número do cartão" error={form.formState.errors.cardNumber?.message}>
            <Input
              {...form.register('cardNumber')}
              placeholder="0000 0000 0000 0000"
              onChange={(e) => form.setValue('cardNumber', formatCardNumber(e.target.value))}
              inputMode="numeric"
              className={cn(form.formState.errors.cardNumber && 'border-destructive')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Validade" error={form.formState.errors.cardExpiry?.message}>
              <Input
                {...form.register('cardExpiry')}
                placeholder="MM/AA"
                onChange={(e) => form.setValue('cardExpiry', formatCardExpiry(e.target.value))}
                inputMode="numeric"
                className={cn(form.formState.errors.cardExpiry && 'border-destructive')}
              />
            </FormField>
            <FormField label="CVV" error={form.formState.errors.cardCvv?.message}>
              <Input
                {...form.register('cardCvv')}
                placeholder="000"
                maxLength={4}
                inputMode="numeric"
                className={cn(form.formState.errors.cardCvv && 'border-destructive')}
              />
            </FormField>
          </div>

          <FormField label="Nome no cartão" error={form.formState.errors.cardName?.message}>
            <Input
              {...form.register('cardName')}
              placeholder="Nome impresso no cartão"
              className={cn(form.formState.errors.cardName && 'border-destructive')}
            />
          </FormField>

          <FormField label="CPF do titular" error={form.formState.errors.cardCpf?.message}>
            <Input
              {...form.register('cardCpf')}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className={cn(form.formState.errors.cardCpf && 'border-destructive')}
            />
          </FormField>

          <FormField label="Parcelas" error={form.formState.errors.installments?.message}>
            <Select
              value={form.watch('installments')}
              onValueChange={(v) => form.setValue('installments', v || "1")}
            >
              <SelectTrigger className={cn(form.formState.errors.installments && 'border-destructive')}>
                <SelectValue placeholder="Selecione as parcelas" />
              </SelectTrigger>
              <SelectContent>
                {INSTALLMENT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 1
                      ? `1x de ${perInstallment(1)} à vista`
                      : `${n}x de ${perInstallment(n)} sem juros`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </form>
      )}

      {/* PIX info */}
      {paymentMethod === 'pix' && (
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-success-subtle border border-success/20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center">
            <QrCode size={32} className="text-success" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-foreground font-body">
              Pagamento via PIX
            </span>
            <span className="text-sm text-muted-foreground font-body leading-relaxed">
              Ao confirmar, você receberá um QR Code para pagar. O pagamento é confirmado em
              instantes.
            </span>
          </div>
          <div className="text-2xl font-bold text-success font-display">
            {formatCurrency(cart.finalTotal)}
          </div>
        </div>
      )}

      {/* Hidden submit trigger for PIX (the footer button handles it) */}
      {paymentMethod === 'pix' && (
        <button
          id="payment-form"
          type="button"
          onClick={handlePixSubmit}
          className="hidden"
          disabled={isLoading}
        />
      )}

      {/* Security notice */}
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
        <Lock size={12} />
        <span className="text-xs font-body">Pagamento 100% seguro e criptografado</span>
      </div>
    </div>
  )
}

function MethodButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all',
        active
          ? 'border-brand bg-brand-subtle text-brand'
          : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground'
      )}
    >
      {icon}
      <span className="text-sm font-semibold font-body">{label}</span>
    </button>
  )
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium font-body">{label}</Label>
      {children}
      {error && <span className="text-xs text-destructive font-body">{error}</span>}
    </div>
  )
}
