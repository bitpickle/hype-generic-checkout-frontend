import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserTickets } from '@/hooks/use-tickets'
import { TicketWalletCard } from '@/components/wallet/ticket-wallet-card'
import { BottomTabs } from '@/components/layout/bottom-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Ticket } from 'lucide-react'
import type { GetTicketDto } from '@/_gen/api/tickets/types.gen'

export const Route = createFileRoute('/_main/wallet/')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: '/wallet' } })
    }
  },
  component: WalletPage,
})

function WalletPage() {
  const navigate = useNavigate()
  const { data: ticketsRaw, isLoading } = useUserTickets()
  const tickets = (Array.isArray(ticketsRaw) ? ticketsRaw : ticketsRaw ? [ticketsRaw] : []) as GetTicketDto[]

  const active = tickets.filter((t) => t.status !== 'used' && t.status !== 'expired')
  const past = tickets.filter((t) => t.status === 'used' || t.status === 'expired')

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <div className="flex flex-col flex-1 pb-2">
        <div className="px-5 pt-10 pb-5">
          <h1 className="text-2xl font-bold text-foreground font-display">Meus ingressos</h1>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            {tickets.length} ingresso{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 flex flex-col gap-3">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-subtle flex items-center justify-center">
              <Ticket size={28} className="text-brand" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-foreground font-body">Nenhum ingresso ainda</p>
              <p className="text-sm text-muted-foreground font-body">
                Explore os eventos disponíveis e adquira seus ingressos
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/' })} className="font-body">
              Ver eventos
            </Button>
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-6 pb-4">
            {active.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-muted-foreground font-body uppercase tracking-wide">
                  Ativos
                </span>
                {active.map((ticket) => (
                  <TicketWalletCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-muted-foreground font-body uppercase tracking-wide">
                  Histórico
                </span>
                {past.map((ticket) => (
                  <TicketWalletCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  )
}
