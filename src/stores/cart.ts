import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type CartTicketDto, cartControllerCreateCart } from '@/_gen/api/tickets/sdk.gen';
import { useAuthStore } from './auth';

export interface CartItem {
  batchId: string;
  quantity: number;
  batchName: string;
  price: number;
  sectionName: string;
  sectionId: string;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  expiresAt: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (batchId: string) => void;
  updateQuantity: (batchId: string, quantity: number) => void;
  clearCart: () => void;
  createApiCart: () => Promise<string | null>;
  calculateTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      expiresAt: null,

      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex((i) => i.batchId === item.batchId);

        if (existingItemIndex !== -1) {
          const updatedItems = [...items];
          // Instead of adding quantities, replace or handle as needed.
          // Usually adding quantity is correct for "Add to Cart" button.
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          };
          set({ items: updatedItems });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (batchId) => {
        set((state) => ({
          items: state.items.filter((i) => i.batchId !== batchId),
        }));
      },

      updateQuantity: (batchId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(batchId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.batchId === batchId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => {
        set({ items: [], cartId: null, expiresAt: null });
      },

      calculateTotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      createApiCart: async () => {
        const { items } = get();
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) return null;
        if (items.length === 0) return null;

        const tickets: CartTicketDto[] = items.map((item) => ({
          batchId: item.batchId,
          quantity: item.quantity,
        }));

        try {
          const response = await cartControllerCreateCart({
            body: { tickets },
          });

          if (response.data) {
            set({
              cartId: response.data.id,
              expiresAt: response.data.expiresAt,
            });
            return response.data.id;
          }
        } catch (error) {
          console.error('Failed to create API cart', error);
          return null;
        }
        return null;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
