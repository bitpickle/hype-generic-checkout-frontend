import { Minus, Plus, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { GetBatchDto } from '@/_gen/api/tickets/types.gen'
import { Badge } from '@/components/ui/badge'
import { Button } from '../ui/button'

interface BatchCardProps {
  batch: GetBatchDto
  quantity: number
  onQuantityChange: (batchId: string, quantity: number) => void
  maxQuantity: number
  minQuantity?: number
  className?: string
}

export function BatchCard({
  batch,
  quantity,
  onQuantityChange,
  maxQuantity,
  minQuantity = 0,
  className,
}: BatchCardProps) {
  const handleDecrement = () => {
    if (quantity <= 0) return
    // From minQuantity, remove entirely (go to 0)
    const next = quantity <= minQuantity ? 0 : quantity - 1
    onQuantityChange(batch.id, next)
  }

  const handleIncrement = () => {
    if (quantity >= maxQuantity) return
    // From 0, jump straight to minQuantity
    const next = quantity === 0 && minQuantity > 1 ? minQuantity : quantity + 1
    onQuantityChange(batch.id, Math.min(next, maxQuantity))
  }

  const isAvailable = batch.isPublished && batch.isPublic

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card overflow-hidden',
        !isAvailable && 'opacity-60',
        className
      )}
    >
      {/* Top section */}
      <div className="flex items-start justify-between p-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-foreground text-base font-body">
              {batch.name}
            </span>
            {!isAvailable && (
              <Badge variant="secondary" className="text-xs">
                Indisponível
              </Badge>
            )}
          </div>
          {batch.description && (
            <p className="text-sm text-muted-foreground font-body">{batch.description}</p>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-body">
              Até {formatDateTime(batch.endsAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-brand font-bold text-lg font-display leading-tight">
            {formatCurrency(batch.price)}
          </span>
          {batch.serviceFee !== null && batch.serviceFee !== undefined && (
            <span className="text-xs text-muted-foreground font-body">
              + {formatCurrency(batch.serviceFee)} taxa
            </span>
          )}
        </div>
      </div>

      {/* Counter section */}
      {isAvailable && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 border-t border-border"
        >
          <Button
            onClick={handleDecrement}
            disabled={quantity <= 0}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
              quantity <= 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-brand-subtle text-brand hover:bg-brand hover:text-primary-foreground'
            )}
            aria-label="Diminuir quantidade"
          >
            <Minus size={16} />
          </Button>

          <span
            className={cn(
              'text-base font-bold w-6 text-center font-body',
              quantity > 0 ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {quantity}
          </span>

          <Button
            onClick={handleIncrement}
            disabled={quantity >= maxQuantity}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
              quantity >= maxQuantity
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-brand-subtle text-brand hover:bg-brand hover:text-primary-foreground'
            )}
            aria-label="Aumentar quantidade"
          >
            <Plus size={16} />
          </Button>

          {quantity > 0 && (
            <span className="ml-auto text-sm font-semibold text-brand font-body">
              {formatCurrency(batch.price * quantity)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
