import { cn } from '@/lib/utils'

interface InfoCardProps {
  icon: React.ReactNode
  iconBgClassName?: string
  label: string
  value: string
  subValue?: string
  className?: string
}

export function InfoCard({ icon, iconBgClassName, label, value, subValue, className }: InfoCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl bg-card border border-border',
        className
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          iconBgClassName ?? 'bg-brand-subtle'
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-muted-foreground font-body font-medium">{label}</span>
        <span className="text-sm font-semibold text-foreground font-body leading-tight truncate">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-muted-foreground font-body">{subValue}</span>
        )}
      </div>
    </div>
  )
}
