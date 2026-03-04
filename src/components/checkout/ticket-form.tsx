import { zodResolver } from '@hookform/resolvers/zod'
import { Ticket, UserCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { UserDataResponseDto } from '@/_gen/api/auth/types.gen'
import type { GetCartTicketDto, GetCustomFormFieldDto } from '@/_gen/api/tickets/types.gen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCpf, formatCurrency, formatPhone } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TicketFormData } from '@/stores/checkout.store'

const ticketFormSchema = z.object({
  firstName: z.string().min(2, 'Nome obrigatório'),
  lastName: z.string().min(2, 'Sobrenome obrigatório'),
  email: z.email('E-mail inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  responses: z.record(z.string(), z.string()),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

interface TicketFormProps {
  ticket: GetCartTicketDto
  ticketIndex: number
  totalTickets: number
  currentData: TicketFormData
  user: UserDataResponseDto | null
  onSubmit: (data: TicketFormData) => void
  submitLabel?: string
}

export function TicketForm({
  ticket,
  ticketIndex,
  totalTickets,
  currentData,
  user,
  onSubmit,
}: TicketFormProps) {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      firstName: currentData.firstName || '',
      lastName: currentData.lastName || '',
      email: currentData.email || '',
      cpf: currentData.cpf || '',
      phone: currentData.phone || '',
      responses: Object.fromEntries(
        (ticket.customForm?.fields ?? []).map((f) => [
          f.id,
          currentData.responses.find((r) => r.fieldId === f.id)?.value ?? '',
        ])
      ),
    },
  })

  const fillWithMyData = () => {
    if (!user) return
    const nameParts = user.name?.split(' ') ?? []
    form.setValue('firstName', nameParts[0] ?? '')
    form.setValue('lastName', nameParts.slice(1).join(' ') ?? '')
    form.setValue('email', user.email ?? '')
  }

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      ticketId: ticket.id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      cpf: values.cpf,
      phone: values.phone,
      responses: Object.entries(values.responses).map(([fieldId, value]) => ({
        fieldId,
        value,
      })),
    })
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: idk
  useEffect(() => {
    form.reset({
      firstName: currentData.firstName || '',
      lastName: currentData.lastName || '',
      email: currentData.email || '',
      cpf: currentData.cpf || '',
      phone: currentData.phone || '',
      responses: Object.fromEntries(
        (ticket.customForm?.fields ?? []).map((f) => [
          f.id,
          currentData.responses.find((r) => r.fieldId === f.id)?.value ?? '',
        ])
      ),
    })
  }, [ticket.id, ticketIndex])

  return (
    <form onSubmit={handleSubmit} id="ticket-form" className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground font-body font-medium">
          Ingresso {ticketIndex + 1} de {totalTickets}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalTickets }).map((_, i) => (
            <div
              key={`stepper-${// biome-ignore lint/suspicious/noArrayIndexKey: noid
                i}`}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                i <= ticketIndex ? 'bg-brand' : 'bg-secondary'
              )}
            />
          ))}
        </div>
      </div>

      {/* Ticket type badge */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-subtle border border-indigo-border">
        <div className="w-9 h-9 rounded-[10px] bg-indigo/20 flex items-center justify-center shrink-0">
          <Ticket size={18} className="text-indigo" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-foreground font-body">{ticket.batchName}</span>
          <span className="text-sm font-medium text-indigo font-body">{formatCurrency(ticket.salePrice)}</span>
        </div>
      </div>

      {/* Fill with my data */}
      {user && ticketIndex === 0 && (
        <Button
          type="button"
          variant="ghost"
          onClick={fillWithMyData}
          className="flex items-center gap-3 w-full h-auto p-3 rounded-xl bg-brand-subtle border border-brand-border hover:bg-brand/15 justify-start text-left"
        >
          <div className="w-9 h-9 rounded-[10px] bg-brand-subtle flex items-center justify-center shrink-0">
            <UserCircle size={18} className="text-brand" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground font-body">Usar meus dados</span>
            <span className="text-xs text-muted-foreground font-body">
              Preencher com os dados da minha conta
            </span>
          </div>
        </Button>
      )}

      {/* Required fields */}
      <div className="flex flex-col gap-4">
        <span className="text-base font-semibold text-foreground font-body">Dados obrigatórios</span>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nome" error={form.formState.errors.firstName?.message}>
              <Input
                {...form.register('firstName')}
                placeholder="Nome"
                className={cn(form.formState.errors.firstName && 'border-destructive')}
              />
            </FormField>
            <FormField label="Sobrenome" error={form.formState.errors.lastName?.message}>
              <Input
                {...form.register('lastName')}
                placeholder="Sobrenome"
                className={cn(form.formState.errors.lastName && 'border-destructive')}
              />
            </FormField>
          </div>

          <FormField label="E-mail" error={form.formState.errors.email?.message}>
            <Input
              {...form.register('email')}
              type="email"
              placeholder="email@exemplo.com"
              className={cn(form.formState.errors.email && 'border-destructive')}
            />
          </FormField>

          <FormField label="CPF" error={form.formState.errors.cpf?.message}>
            <Input
              {...form.register('cpf')}
              placeholder="000.000.000-00"
              onChange={(e) => form.setValue('cpf', formatCpf(e.target.value))}
              className={cn(form.formState.errors.cpf && 'border-destructive')}
            />
          </FormField>

          <FormField label="Telefone" error={form.formState.errors.phone?.message}>
            <Input
              {...form.register('phone')}
              placeholder="(11) 99999-0000"
              onChange={(e) => form.setValue('phone', formatPhone(e.target.value))}
              className={cn(form.formState.errors.phone && 'border-destructive')}
            />
          </FormField>
        </div>
      </div>

      {/* Custom fields */}
      {ticket.customForm && ticket.customForm.fields.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="text-base font-semibold text-foreground font-body">
            Campos personalizados
          </span>
          <div className="flex flex-col gap-3">
            {ticket.customForm.fields.map((field) => (
              <CustomFormField
                key={field.id}
                field={field}
                value={form.watch(`responses.${field.id}`) ?? ''}
                onChange={(val) => form.setValue(`responses.${field.id}`, val)}
                error={form.formState.errors.responses?.[field.id]?.message}
              />
            ))}
          </div>
        </div>
      )}
    </form>
  )
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium font-body">{label}</Label>
      {children}
      {error && <span className="text-xs text-destructive font-body">{error}</span>}
    </div>
  )
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: realmente complexo
function CustomFormField({
  field,
  value,
  onChange,
  error,
}: {
  field: GetCustomFormFieldDto
  value: string
  onChange: (val: string) => void
  error?: string
}) {
  return (
    <FormField label={field.question} error={error}>
      {(field.type === 'select' || field.type === 'radio') && field.options ? (
        field.type === 'select' ? (
          <Select value={value} onValueChange={(v) => onChange(v || '')}>
            <SelectTrigger className={cn(error && 'border-destructive')}>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <RadioGroup value={value} onValueChange={onChange} className="flex flex-col gap-2">
            {field.options.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                <Label htmlFor={`${field.id}-${opt}`} className="font-normal font-body">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      ) : field.type === 'textarea' ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Sua resposta..."
          className={cn(error && 'border-destructive')}
        />
      ) : (
        <Input
          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'phone' ? 'tel' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.question}
          required={field.required}
          className={cn(error && 'border-destructive')}
        />
      )}
    </FormField>
  )
}
