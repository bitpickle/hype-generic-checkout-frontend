import { createFileRoute } from '@tanstack/react-router';
import { EventList } from '@/components/event-list';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground/90">Próximos Eventos</h1>
      <EventList />
    </div>
  );
}
