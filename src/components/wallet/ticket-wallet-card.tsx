import { Link } from '@tanstack/react-router'
import { ArrowRightLeft, RotateCcw, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateTime, formatCurrency } from '@/lib/format'
import type { GetTicketDto } from '@/_gen/api/tickets/types.gen'
import { Badge } from '@/components/ui/badge'

interface TicketWalletCardProps {
  ticket: GetTicketDto
  eventName?: string
  eventBannerUrl?: string
  orderId?: string
  className?: string
}

const statusConfig = {
  open: { label: 'Disponível', className: 'bg-success-subtle text-success border-success/20', icon: CheckCircle2 },
  locked: { label: 'Bloqueado', className: 'bg-warning-subtle text-warning-foreground border-warning/20', icon: Clock },
  purchased: { label: 'Comprado', className: 'bg-indigo-subtle text-indigo border-indigo/20', icon: CheckCircle2 },
  used: { label: 'Utilizado', className: 'bg-secondary text-muted-foreground border-border', icon: CheckCircle2 },
  expired: { label: 'Expirado', className: 'bg-secondary text-muted-foreground border-border', icon: XCircle },
}

export function TicketWalletCard({ ticket, eventName, eventBannerUrl, orderId, className }: TicketWalletCardProps) {
  const status = statusConfig[ticket.status] ?? statusConfig.open
  const StatusIcon = status.icon
  const isPast = ticket.status === 'used' || ticket.status === 'expired'
  const canTransfer = ticket.status === 'purchased' || ticket.status === 'open'
  const canRefund = (ticket.status === 'purchased' || ticket.status === 'open') && orderId

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card overflow-hidden transition-opacity',
        isPast && 'opacity-60',
        className
      )}
    >
      {/* Top: event info */}
      <div className="flex items-center gap-3.5 p-4">
        {eventBannerUrl && (
          <div
            className="w-13 h-13 rounded-xl shrink-0 bg-muted bg-cover bg-center"
            style={{ backgroundImage: `url(${eventBannerUrl})` }}
          />
        )}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-base font-semibold text-foreground font-body leading-tight truncate">
            {eventName ?? 'Evento'}
          </span>
          <span className="text-sm text-muted-foreground font-body">
            {ticket.batch.name} · {formatCurrency(ticket.salePrice)}
          </span>
          {ticket.adquireAt && (
            <span className="text-xs text-muted-foreground font-body">
              {formatDateTime(ticket.adquireAt)}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border" />

      {/* Bottom: status + actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold font-body',
              status.className
            )}
          >
            <StatusIcon size={12} />
            {status.label}
          </div>
          {ticket.ticketCode && (
            <Badge variant="outline" className="text-xs font-mono font-body">
              #{ticket.ticketCode.slice(-6)}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        {!isPast && (
          <div className="flex items-center gap-2">
            {canTransfer && (
              <Link
                to="/wallet/transfer/$ticketId"
                params={{ ticketId: ticket.id }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body font-medium px-2 py-1 rounded-lg hover:bg-secondary"
              >
                <ArrowRightLeft size={14} />
                Transferir
              </Link>
            )}
            {canRefund && (
              <Link
                to="/wallet/refund/$ticketId"
                params={{ ticketId: ticket.id }}
                search={{ orderId: orderId! }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors font-body font-medium px-2 py-1 rounded-lg hover:bg-destructive/10"
              >
                <RotateCcw size={14} />
                Estorno
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
