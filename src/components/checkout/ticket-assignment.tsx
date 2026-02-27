import { zodResolver } from '@hookform/resolvers/zod';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

const ticketSchema = z.object({
  firstName: z.string().min(2, 'Nome é obrigatório'),
  lastName: z.string().min(2, 'Sobrenome é obrigatório'),
  email: z.string().email('Email inválido'),
  // Additional fields based on custom form can be dynamic
  customFields: z.record(z.string(), z.string()).optional(),
});

const ticketsSchema = z.object({
  tickets: z.array(ticketSchema),
});

interface TicketAssignmentProps {
  onNext: (data: z.infer<typeof ticketsSchema>) => void;
}

export function TicketAssignment({ onNext }: TicketAssignmentProps) {
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const [copiedInfo, setCopiedInfo] = useState(false);

  // Flatten cart items to individual tickets for form handling
  // We need to store original item info to map back later if needed, but for form simple array is enough
  const ticketItems = items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, i) => ({
      ...item,
      uniqueId: `${item.batchId}-${i}`,
      displayIndex: i + 1,
    }))
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof ticketsSchema>>({
    resolver: zodResolver(ticketsSchema),
    defaultValues: {
      tickets: ticketItems.map(() => ({
        firstName: '',
        lastName: '',
        email: '',
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'tickets',
  });

  const handleCopyMyInfo = (index: number) => {
    if (user) {
      setValue(`tickets.${index}.firstName`, user.firstName || user.name?.split(' ')[0] || '');
      setValue(
        `tickets.${index}.lastName`,
        user.lastName || user.name?.split(' ').slice(1).join(' ') || ''
      );
      setValue(`tickets.${index}.email`, user.email || '');
      setCopiedInfo(true);
    }
  };

  const onSubmit = (data: z.infer<typeof ticketsSchema>) => {
    onNext(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dados dos Ingressos</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyMyInfo(0)}
          disabled={copiedInfo}
        >
          <Copy className="mr-2 h-4 w-4" />
          Preencher com meus dados (1º ingresso)
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-6 space-y-4 shadow-sm bg-card">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="font-medium text-lg">Ingresso {index + 1}</h3>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                {ticketItems[index].batchName}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`tickets.${index}.firstName`}>Nome</Label>
                <Input {...register(`tickets.${index}.firstName`)} />
                {errors.tickets?.[index]?.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.tickets[index]?.firstName?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`tickets.${index}.lastName`}>Sobrenome</Label>
                <Input {...register(`tickets.${index}.lastName`)} />
                {errors.tickets?.[index]?.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.tickets[index]?.lastName?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`tickets.${index}.email`}>Email</Label>
                <Input type="email" {...register(`tickets.${index}.email`)} />
                {errors.tickets?.[index]?.email && (
                  <p className="text-sm text-destructive">
                    {errors.tickets[index]?.email?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Ir para Pagamento
          </Button>
        </div>
      </form>
    </div>
  );
}
