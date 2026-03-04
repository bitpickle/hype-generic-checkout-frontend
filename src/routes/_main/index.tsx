import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useSearchEvents } from '@/hooks/use-events'
import { BottomTabs } from '@/components/layout/bottom-tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useState } from 'react'

export const Route = createFileRoute('/_main/')({
  component: HomePage,
  validateSearch: z.object({
    q: z.string().optional(),
  }),
})

function EventCard({ event }: { event: { id: string; name: string; bannerImage: string; startsAt: string; address: { city: string; state: string } } }) {
  return (
    <Link
      to="/event/$eventId"
      params={{ eventId: event.id }}
      className="block rounded-2xl border border-border bg-card overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div
        className="w-full h-44 bg-muted bg-cover bg-center"
        style={{ backgroundImage: `url(${event.bannerImage})` }}
      />
      <div className="p-4">
        <h3 className="font-semibold text-foreground font-body text-base leading-tight line-clamp-2">
          {event.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
          <Calendar size={13} />
          <span className="text-xs font-body">{formatDate(event.startsAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
          <MapPin size={13} />
          <span className="text-xs font-body">{event.address.city}, {event.address.state}</span>
        </div>
      </div>
    </Link>
  )
}

function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Skeleton className="w-full h-44" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  )
}

function HomePage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data, isLoading } = useSearchEvents(debouncedSearch || undefined)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setTimeout(() => setDebouncedSearch(value), 400)
  }

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <div className="flex flex-col flex-1 pb-2">
        <div className="px-5 pt-10 pb-4">
          <h1 className="text-2xl font-bold text-foreground font-display">Eventos</h1>
          <p className="text-sm text-muted-foreground font-body mt-0.5">Encontre seu próximo evento</p>
        </div>

        <div className="px-5 mb-5">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar eventos..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="px-5 flex flex-col gap-4">
          {isLoading ? (
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-body">Nenhum evento encontrado</p>
              {debouncedSearch && (
                <p className="text-sm text-muted-foreground/60 font-body mt-1">
                  para &quot;{debouncedSearch}&quot;
                </p>
              )}
            </div>
          ) : (
            data?.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>

      <BottomTabs />
    </div>
  )
}
