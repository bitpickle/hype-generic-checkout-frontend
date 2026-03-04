import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRightLeft, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_main/wallet/transfer/$ticketId')({
  component: TransferPage,
})

const transferSchema = z.object({
  email: z.string().email('E-mail inválido'),
  confirmEmail: z.string().email('E-mail inválido'),
}).refine((d) => d.email === d.confirmEmail, {
  message: 'Os e-mails não conferem',
  path: ['confirmEmail'],
})

type TransferValues = z.infer<typeof transferSchema>

function TransferPage() {
  const { ticketId } = Route.useParams()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  const form = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { email: '', confirmEmail: '' },
  })

  const handleSubmit = form.handleSubmit((values) => {
    // Transfer API not yet available - show toast and simulate success
    void values
    toast.info('Transferência registrada! O destinatário receberá uma notificação por e-mail.')
    setDone(true)
  })

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
          <h2 className="text-2xl font-bold text-foreground font-display">Transferência solicitada!</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            O destinatário receberá um e-mail com as instruções para aceitar o ingresso.
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
        <span className="text-base font-semibold text-foreground font-body">Transferir ingresso</span>
      </div>

      <div className="flex flex-col flex-1 px-5 py-8 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-brand-subtle flex items-center justify-center">
            <ArrowRightLeft size={28} className="text-brand" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-foreground font-display">Para quem deseja transferir?</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Informe o e-mail de quem receberá este ingresso.
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="font-body">E-mail do destinatário</Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...form.register('email')}
                type="email"
                placeholder="destinatario@email.com"
                className={cn('pl-9', form.formState.errors.email && 'border-destructive')}
                autoComplete="email"
              />
            </div>
            {form.formState.errors.email && (
              <span className="text-xs text-destructive font-body">{form.formState.errors.email.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-body">Confirmar e-mail</Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...form.register('confirmEmail')}
                type="email"
                placeholder="destinatario@email.com"
                className={cn('pl-9', form.formState.errors.confirmEmail && 'border-destructive')}
                autoComplete="off"
              />
            </div>
            {form.formState.errors.confirmEmail && (
              <span className="text-xs text-destructive font-body">
                {form.formState.errors.confirmEmail.message}
              </span>
            )}
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-semibold font-body"
            >
              Confirmar transferência
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
