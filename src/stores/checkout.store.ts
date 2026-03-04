import { create } from 'zustand'
import type { GetDetailedCartDto, GetOrderDto } from '@/_gen/api/tickets/types.gen'

export type CheckoutStep =
  | 'cart'
  | 'ticket-data'
  | 'payment'
  | 'processing'
  | 'success'
  | 'expired'

export interface TicketFormData {
  ticketId: string
  firstName: string
  lastName: string
  email: string
  cpf: string
  phone: string
  responses: Array<{ fieldId: string; value: string }>
}

interface CheckoutState {
  step: CheckoutStep
  cart: GetDetailedCartDto | null
  currentTicketIndex: number
  ticketsData: TicketFormData[]
  order: GetOrderDto | null
  paymentMethod: 'credit_card' | 'pix'
  couponCode: string | null

  setStep: (step: CheckoutStep) => void
  setCart: (cart: GetDetailedCartDto) => void
  setTicketData: (index: number, data: TicketFormData) => void
  setOrder: (order: GetOrderDto) => void
  setPaymentMethod: (method: 'credit_card' | 'pix') => void
  setCouponCode: (code: string | null) => void
  nextTicket: () => void
  prevTicket: () => void
  resetCheckout: () => void
}

const initialState = {
  step: 'cart' as CheckoutStep,
  cart: null,
  currentTicketIndex: 0,
  ticketsData: [],
  order: null,
  paymentMethod: 'credit_card' as const,
  couponCode: null,
}

export const useCheckoutStore = create<CheckoutState>()((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setCart: (cart) => {
    const { ticketsData } = get()
    // Initialize ticket data array if needed
    const newTicketsData = cart.tickets.map((ticket, i) => ({
      ticketId: ticket.id,
      firstName: ticketsData[i]?.firstName ?? '',
      lastName: ticketsData[i]?.lastName ?? '',
      email: ticketsData[i]?.email ?? '',
      cpf: ticketsData[i]?.cpf ?? '',
      phone: ticketsData[i]?.phone ?? '',
      responses: ticketsData[i]?.responses ?? [],
    }))
    set({ cart, ticketsData: newTicketsData })
  },

  setTicketData: (index, data) =>
    set((state) => {
      const updated = [...state.ticketsData]
      updated[index] = data
      return { ticketsData: updated }
    }),

  setOrder: (order) => set({ order }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  setCouponCode: (couponCode) => set({ couponCode }),

  nextTicket: () =>
    set((state) => {
      const nextIndex = state.currentTicketIndex + 1
      const totalTickets = state.cart?.tickets.length ?? 0
      if (nextIndex >= totalTickets) {
        return { step: 'payment' }
      }
      return { currentTicketIndex: nextIndex }
    }),

  prevTicket: () =>
    set((state) => {
      if (state.currentTicketIndex === 0) {
        return { step: 'cart' }
      }
      return { currentTicketIndex: state.currentTicketIndex - 1 }
    }),

  resetCheckout: () => set(initialState),
}))
