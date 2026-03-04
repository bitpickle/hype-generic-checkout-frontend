import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LocalCartItem {
  batchId: string
  batchName: string
  sectionName: string
  sectionId: string
  price: number
  serviceFee: number | null
  quantity: number
  customFormId: string | null
}

export interface LocalCartEvent {
  id: string
  name: string
  startsAt: string
  endsAt: string
  bannerImage: string
  venueName: string
  venueCity: string
  venueState: string
  serviceFeeRate: number
  isServiceFeeIncluded: boolean
}

interface CartState {
  event: LocalCartEvent | null
  items: LocalCartItem[]

  setEvent: (event: LocalCartEvent) => void
  updateQuantity: (batchId: string, quantity: number) => void
  clearCart: () => void
  getTotalQuantity: () => number
  getTotalPrice: () => number
  getTotalServiceFee: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      event: null,
      items: [],

      setEvent: (event) => set({ event }),

      updateQuantity: (batchId, quantity) =>
        set((state) => ({
          items: quantity > 0
            ? state.items.some((i) => i.batchId === batchId)
              ? state.items.map((i) => (i.batchId === batchId ? { ...i, quantity } : i))
              : state.items.concat({ batchId, batchName: '', sectionName: '', sectionId: '', price: 0, serviceFee: null, quantity, customFormId: null })
            : state.items.filter((i) => i.batchId !== batchId),
        })),

      clearCart: () => set({ event: null, items: [] }),

      getTotalQuantity: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      getTotalPrice: () => {
        const { items, event } = get()
        const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
        if (!event) return subtotal
        if (event.isServiceFeeIncluded) return subtotal
        const fee = items.reduce((acc, i) => {
          const itemFee = i.serviceFee ?? i.price * event.serviceFeeRate
          return acc + itemFee * i.quantity
        }, 0)
        return subtotal + fee
      },

      getTotalServiceFee: () => {
        const { items, event } = get()
        if (!event || event.isServiceFeeIncluded) return 0
        return items.reduce((acc, i) => {
          const itemFee = i.serviceFee ?? i.price * event.serviceFeeRate
          return acc + itemFee * i.quantity
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
