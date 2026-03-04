import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import { motion } from 'motion/react'
import { RotateCcw, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCancelTicket } from '@/hooks/use-order'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/_main/wallet/refund/$ticketId')({
  component: RefundPage,
  validateSearch: z.object({
    orderId: z.string(),
  }),
})

function RefundPage() {
  const { ticketId } = Route.useParams()
  const { orderId } = Route.useSearch()
  const navigate = useNavigate()
  const cancelTicket = useCancelTicket()
  const queryClient = useQueryClient()
  const [done, setDone] = useState(false)

  const handleConfirm = async () => {
    const result = await cancelTicket.mutateAsync({ orderId, ticketId })
    if (result.data) {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] })
      setDone(true)
    }
  }

  if (done) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-svh gap-6 px-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-20 h-20 rounded-full bg-success-subtle flex items-center justify-center">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-foreground font-display">Estorno solicitado</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Sua solicitação foi registrada. O valor será devolvido em até 7 dias úteis.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: '/wallet' })}
          className="w-full h-14 rounded-2xl text-base font-semibold font-body"
        >
          Voltar para a carteira
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-4 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate({ to: '/wallet' })}
          className="rounded-full"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Button>
        <span className="text-base font-semibold text-foreground font-body">Solicitar estorno</span>
      </div>

      <div className="flex flex-col flex-1 px-5 py-8 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <RotateCcw size={28} className="text-destructive" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-foreground font-display">Confirmar estorno</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Tem certeza que deseja solicitar o estorno deste ingresso? Esta ação não pode ser desfeita.
            </p>
          </div>
        </motion.div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning-subtle border border-warning/20">
          <AlertTriangle size={18} className="text-warning-foreground mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground font-body">Informações importantes</span>
            <ul className="text-sm text-muted-foreground font-body space-y-1 list-disc list-inside">
              <li>O prazo para estorno é de até 7 dias úteis</li>
              <li>O valor será devolvido na forma de pagamento original</li>
              <li>O ingresso será cancelado imediatamente</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 flex flex-col gap-3">
        <Button
          onClick={handleConfirm}
          disabled={cancelTicket.isPending}
          variant="destructive"
          className="w-full h-14 rounded-2xl text-base font-semibold font-body"
        >
          {cancelTicket.isPending ? 'Processando...' : 'Confirmar estorno'}
        </Button>
        <Button
          onClick={() => navigate({ to: '/wallet' })}
          variant="ghost"
          className="w-full h-12 rounded-2xl text-base font-body"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
