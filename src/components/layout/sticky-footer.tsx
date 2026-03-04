import { cn } from '@/lib/utils'

interface StickyFooterProps {
  children: React.ReactNode
  className?: string
}

export function StickyFooter({ children, className }: StickyFooterProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 bg-card border-t border-border px-5 pt-4 pb-8',
        className
      )}
    >
      {children}
    </div>
  )
}
