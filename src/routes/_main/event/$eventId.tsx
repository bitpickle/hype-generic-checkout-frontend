import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEvent } from '@/hooks/use-events'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import { EventBanner } from '@/components/event/event-banner'
import { BatchCard } from '@/components/event/batch-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Calendar, Clock, Users } from 'lucide-react'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/format'
import { motion, AnimatePresence } from 'motion/react'
import type { GetSectionWithBatchesDto } from '@/_gen/api/tickets/types.gen'

export const Route = createFileRoute('/_main/event/$eventId')({
  component: EventPage,
})

function resolveLimit(batchVal: number, sectionVal: number, eventVal: number): number {
  return batchVal || sectionVal || eventVal
}

function SectionBlock({ section, eventMin, eventMax, quantities, onQuantityChange }: {
  section: GetSectionWithBatchesDto
  eventMin: number
  eventMax: number
  quantities: Record<string, number>
  onQuantityChange: (batchId: string, qty: number) => void
}) {
  if (!section.isVisible) return null

  const publishedBatches = section.batches.filter((b) => b.isPublished && b.isPublic)
  if (publishedBatches.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-semibold text-foreground font-body">{section.name}</h3>
        {section.description && (
          <p className="text-xs text-muted-foreground font-body">{section.description}</p>
        )}
      </div>
      {publishedBatches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          quantity={quantities[batch.id] ?? 0}
          onQuantityChange={onQuantityChange}
          minQuantity={resolveLimit(batch.qntMinPerCustomer, section.qntMinPerCustomer, eventMin)}
          maxQuantity={resolveLimit(batch.qntMaxPerCustomer, section.qntMaxPerCustomer, eventMax)}
        />
      ))}
    </div>
  )
}

function EventPage() {
  const { eventId } = Route.useParams()
  const navigate = useNavigate()
  const { data: event, isLoading } = useEvent(eventId)
  const { isAuthenticated } = useAuthStore()

  const { event: cartEvent, items, setEvent, updateQuantity, getTotalQuantity, getTotalPrice } = useCartStore()

  // quantities map: batchId -> quantity
  const quantities: Record<string, number> = {}
  items.forEach((item) => {
    quantities[item.batchId] = item.quantity
  })

  const handleQuantityChange = (batchId: string, qty: number, batch: { name: string; price: number; serviceFee: number | null }, section: GetSectionWithBatchesDto) => {
    if (!event) return

    // If switching events, clear cart first
    if (cartEvent && cartEvent.id !== event.id) {
      useCartStore.getState().clearCart()
    }

    if (!cartEvent || cartEvent.id !== event.id) {
      setEvent({
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        bannerImage: event.bannerImage,
        venueName: event.address.name,
        venueCity: event.address.city,
        venueState: event.address.state,
        serviceFeeRate: event.serviceFeeRate,
        isServiceFeeIncluded: event.isServiceFeeIncludedInTicketPrice,
      })
    }

    // Make sure the item has all the correct metadata
    const existingItem = items.find((i) => i.batchId === batchId)
    if (!existingItem || existingItem.batchName !== batch.name) {
      // Update with full metadata
      useCartStore.setState((state) => ({
        items: qty > 0
          ? state.items.some((i) => i.batchId === batchId)
            ? state.items.map((i) => i.batchId === batchId ? { ...i, quantity: qty, batchName: batch.name, sectionName: section.name, sectionId: section.id, price: batch.price, serviceFee: batch.serviceFee } : i)
            : [...state.items, { batchId, batchName: batch.name, sectionName: section.name, sectionId: section.id, price: batch.price, serviceFee: batch.serviceFee, quantity: qty, customFormId: null }]
          : state.items.filter((i) => i.batchId !== batchId)
      }))
    } else {
      updateQuantity(batchId, qty)
    }
  }

  const totalQty = getTotalQuantity()
  const totalPrice = getTotalPrice()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/checkout' } })
    } else {
      navigate({ to: '/checkout' })
    }
  }

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({ title: event.name, url: window.location.href })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-svh">
        <Skeleton className="w-full h-[260px]" />
        <div className="flex flex-col gap-4 px-5 pt-5">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/5" />
          <div className="flex flex-col gap-3 mt-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh px-5">
        <p className="text-muted-foreground font-body">Evento não encontrado</p>
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mt-4 font-body">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <EventBanner
        imageUrl={event.bannerImage}
        onBack={() => navigate({ to: '/' })}
        onShare={handleShare}
      />

      <div className="flex flex-col flex-1 px-5 pt-5 pb-32 gap-6">
        {/* Event header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          <h1 className="text-2xl font-bold text-foreground font-display leading-tight">
            {event.name}
          </h1>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} className="text-brand shrink-0" />
              <span className="text-sm font-body">{formatDate(event.startsAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} className="text-brand shrink-0" />
              <span className="text-sm font-body">{formatDateTime(event.startsAt)} – {formatDateTime(event.endsAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} className="text-brand shrink-0" />
              <span className="text-sm font-body">
                {event.address.name}, {event.address.address}{event.address.addressNum ? `, ${event.address.addressNum}` : ''} · {event.address.city}, {event.address.state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users size={16} className="text-brand shrink-0" />
              <span className="text-sm font-body">
                {event.qntMinPerCustomer === event.qntMaxPerCustomer
                  ? `${event.qntMaxPerCustomer} ingresso(s) por pessoa`
                  : `${event.qntMinPerCustomer}–${event.qntMaxPerCustomer} ingressos por pessoa`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Sections & Batches */}
        <div className="flex flex-col gap-6">
          <h2 className="text-base font-semibold text-foreground font-body">Ingressos</h2>
          {event.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              eventMin={event.qntMinPerCustomer}
              eventMax={event.qntMaxPerCustomer}
              quantities={quantities}
              onQuantityChange={(batchId, qty) => {
                const batch = section.batches.find((b) => b.id === batchId)
                if (batch) handleQuantityChange(batchId, qty, batch, section)
              }}
            />
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-0 inset-x-0 max-w-120 mx-auto px-5 pb-6 pt-3 bg-background/95 backdrop-blur-md border-t border-border"
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-14 rounded-2xl text-base font-semibold font-body flex items-center justify-between px-5"
            >
              <span>{totalQty} ingresso{totalQty !== 1 ? 's' : ''}</span>
              <span>{formatCurrency(totalPrice)}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
