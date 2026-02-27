import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { QrCode } from 'lucide-react';
import { ticketControllerGetUserTickets } from '@/_gen/api/tickets/sdk.gen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/my-tickets')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated } = useAuthStore();

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await ticketControllerGetUserTickets();
      // The API currently returns a single GetTicketDto?
      // Checking types: TicketControllerGetUserTicketsResponses -> default: GetTicketDto.
      // Usually it should be an array. Let's check the type definition again.
      // If it is single object, it might be a mistake in the spec or generator.
      // Assuming it returns an array for now based on context, but if types say GetTicketDto,
      // maybe the endpoint is paginated or filter based?
      // Let's assume it returns an array or we wrap it.
      // Wait, let's double check the `GetTicketDto` definition.
      // It looks like a single ticket object.
      // If the endpoint is `/tickets/tickets` (GET), usually it's a list.
      // If the spec says single object, we might need to handle it.

      // For now, let's treat it as if it returns data.
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">Você precisa estar logado</h3>
        <p className="text-muted-foreground mb-4">Faça login para ver seus ingressos.</p>
        <Button asChild>
          <a href="/login">Entrar</a>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Ingressos</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-[200px] rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold text-destructive">Erro ao carregar ingressos</h3>
        <p className="text-muted-foreground">Tente novamente mais tarde.</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0 || !tickets[0]) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Ingressos</h1>
        <div className="text-center py-12 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">Você ainda não possui ingressos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meus Ingressos</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-primary/5 p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{ticket.batch?.name || 'Ingresso'}</h3>
                  <p className="text-sm text-muted-foreground">Código: {ticket.ticketCode}</p>
                </div>
                <Badge variant={ticket.status === 'purchased' ? 'default' : 'secondary'}>
                  {ticket.status === 'purchased' ? 'Ativo' : ticket.status}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Titular:</span>
                  <span>
                    {ticket.firstName} {ticket.lastName}
                  </span>
                </div>
                {/* Add event info if available in ticket DTO, currently not deep populated in GetTicketDto based on types */}
                {/* Assuming we might want to show event info, but strictly using DTO fields for now */}
              </div>

              <div className="pt-4 flex gap-2">
                <Button className="flex-1" variant="outline">
                  <QrCode className="mr-2 h-4 w-4" />
                  Ver QR Code
                </Button>
                {/* Refund/Cancel logic would be here */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
