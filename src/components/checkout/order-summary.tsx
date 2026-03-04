import { formatCurrency } from '@/lib/format'
import type { GetDetailedCartDto } from '@/_gen/api/tickets/types.gen'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'

interface OrderSummaryProps {
  cart: GetDetailedCartDto
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
      <span className="text-base font-semibold text-foreground font-body">Resumo do pedido</span>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-body">Subtotal</span>
          <span className="text-sm font-medium text-foreground font-body">
            {formatCurrency(cart.originalTotal)}
          </span>
        </div>

        {cart.totalServiceFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-body">Taxa de serviço</span>
            <span className="text-sm font-medium text-foreground font-body">
              {formatCurrency(cart.totalServiceFee)}
            </span>
          </div>
        )}

        {cart.coupon && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag size={13} className="text-success" />
              <span className="text-sm text-success font-body">{cart.coupon.couponCode}</span>
            </div>
            <span className="text-sm font-medium text-success font-body">
              - {formatCurrency(cart.discountAmount)}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground font-body">Total</span>
          <span className="text-lg font-bold text-brand font-display">
            {formatCurrency(cart.finalTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}

interface CartTicketItemProps {
  batchName: string
  sectionName: string
  quantity: number
  salePrice: number
}

export function CartTicketItem({ batchName, sectionName, quantity, salePrice }: CartTicketItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-1 flex-1 min-w-0 mr-4">
        <span className="text-base font-semibold text-foreground font-body truncate">
          {batchName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-body">{sectionName}</span>
          <Badge variant="secondary" className="text-xs font-body">
            Qtd: {quantity}
          </Badge>
        </div>
      </div>
      <span className="text-base font-semibold text-brand font-body shrink-0">
        {formatCurrency(salePrice * quantity)}
      </span>
    </div>
  )
}
