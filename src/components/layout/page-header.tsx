import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CountdownTimer } from '@/components/countdown-timer'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  expiresAt?: string | null
  className?: string
  rightSlot?: React.ReactNode
}

export function PageHeader({ title, onBack, expiresAt, className, rightSlot }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between pt-14 pb-3 px-5 bg-background sticky top-0 z-10',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="-ml-1 rounded-lg"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} />
          </Button>
        )}
        <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {expiresAt && <CountdownTimer expiresAt={expiresAt} />}
        {rightSlot}
      </div>
    </header>
  )
}
