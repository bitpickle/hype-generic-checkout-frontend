import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, MapPinIcon, Ticket } from 'lucide-react';
import { eventControllerFindOne } from '@/api/tickets/sdk.gen';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/event/$eventId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { eventId } = Route.useParams();

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await eventControllerFindOne({ path: { id: eventId } });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">Evento não encontrado</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Banner */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-lg mb-8">
        <img
          src={event.bannerImage || '/placeholder-banner.jpg'}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {!event.isPublished && <Badge variant="destructive">Rascunho</Badge>}
          {event.isCancelled && <Badge variant="destructive">Cancelado</Badge>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
            <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>{format(new Date(event.startsAt), "PPP 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              {event.address && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  <span>
                    {event.address.city}, {event.address.state}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <h3 className="text-xl font-semibold mb-2">Sobre o evento</h3>
            <p className="text-muted-foreground leading-relaxed">
              {/* Description is not explicitly in GetEventDto currently, add if available later.
                       Assuming it might be added or we just show a placeholder if not present.
                   */}
              Detalhes do evento e informações importantes para os participantes.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Localização</h3>
            {event.address ? (
              <div className="bg-muted/30 p-4 rounded-lg border">
                <p className="font-medium">{event.address.name}</p>
                <p className="text-muted-foreground">
                  {event.address.address}, {event.address.addressNum}
                </p>
                <p className="text-muted-foreground">
                  {event.address.neighborhood} - {event.address.city}/{event.address.state}
                </p>
                <p className="text-muted-foreground">{event.address.zipcode}</p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Local a definir</p>
            )}
          </div>
        </div>

        {/* Sidebar / Tickets */}
        <div className="space-y-6">
          <div className="sticky top-24 border rounded-xl p-6 shadow-sm bg-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5" /> Ingressos
            </h3>

            {event.sections && event.sections.length > 0 ? (
              <div className="space-y-4">
                {event.sections.map((section) => (
                  <div key={section.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <h4 className="font-medium mb-2">{section.name}</h4>
                    {section.batches && section.batches.length > 0 ? (
                      <div className="space-y-2">
                        {section.batches.map((batch) => (
                          <div
                            key={batch.id}
                            className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <div>
                              <span className="block font-medium">{batch.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {batch.ticketsLimit > 0 ? 'Disponível' : 'Esgotado'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="block font-bold">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(batch.price)}
                              </span>
                            </div>
                            {/* Add to cart logic will go here */}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhum lote disponível.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Ingressos indisponíveis no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
