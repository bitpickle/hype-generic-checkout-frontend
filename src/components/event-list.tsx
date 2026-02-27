import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { eventControllerFindAll } from '@/_gen/api/tickets/sdk.gen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EventList() {
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventControllerFindAll();
      return response.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="h-[350px] rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold text-destructive">Erro ao carregar eventos</h3>
        <p className="text-muted-foreground">Tente novamente mais tarde.</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">Nenhum evento encontrado</h3>
        <p className="text-muted-foreground">Fique atento para novidades!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => (
        <Card
          key={event.id}
          className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
        >
          <div className="aspect-video w-full overflow-hidden bg-muted relative">
            {event.bannerImage ? (
              <img
                src={event.bannerImage}
                alt={event.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem imagem
              </div>
            )}
            {!event.isPublished && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                Rascunho
              </Badge>
            )}
            {event.isCancelled && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                Cancelado
              </Badge>
            )}
          </div>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="line-clamp-1 text-lg" title={event.name}>
              {event.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 min-h-[40px]">
              {/* Description is not available in GetEventDto, showing nothing or add if available in future */}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 shrink-0" />
                <span>{format(new Date(event.startsAt), "PPP 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {event.address
                    ? `${event.address.address}, ${event.address.addressNum} - ${event.address.city}/${event.address.state}`
                    : 'Local a definir'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
            <Button asChild className="w-full">
              <Link to="/event/$eventId" params={{ eventId: event.id }}>
                Ver Detalhes
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
