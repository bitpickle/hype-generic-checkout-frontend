import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  expiresAt: string
  onExpire?: () => void
  className?: string
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CountdownTimer({ expiresAt, onExpire, className }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.()
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(interval)
          onExpire?.()
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire, secondsLeft])

  const isUrgent = secondsLeft < 60

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold font-body transition-colors',
        isUrgent
          ? 'bg-destructive/10 text-destructive'
          : 'bg-brand-subtle text-brand',
        className
      )}
    >
      <Timer size={14} />
      <span>{formatTime(secondsLeft)}</span>
    </div>
  )
}
