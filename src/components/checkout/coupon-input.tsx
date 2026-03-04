import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GetCartCouponDto } from '@/_gen/api/tickets/types.gen'

interface CouponInputProps {
  appliedCoupon: GetCartCouponDto | null
  onApply: (code: string) => void
  onRemove: () => void
  isLoading?: boolean
}

export function CouponInput({ appliedCoupon, onApply, onRemove, isLoading }: CouponInputProps) {
  const [code, setCode] = useState('')

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase())
      setCode('')
    }
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-success-subtle border border-success/30">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-success" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground font-body">
              {appliedCoupon.couponCode}
            </span>
            {appliedCoupon.description && (
              <span className="text-xs text-muted-foreground font-body">
                {appliedCoupon.description}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Remover cupom"
        >
          <X size={16} />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Código do cupom"
        className="flex-1"
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleApply}
        disabled={!code.trim() || isLoading}
        className={cn('shrink-0')}
      >
        Aplicar
      </Button>
    </div>
  )
}
