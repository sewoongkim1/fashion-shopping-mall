import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  color: string;
  size: string;
  price: number;       // 실결제 단가 (할인가 또는 정가)
  originalPrice: number; // 원래 가격
  quantity: number;
  stock: number;       // 해당 옵션 재고
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.productId === newItem.productId && i.color === newItem.color && i.size === newItem.size,
        );

        if (existing) {
          const newQty = Math.min(existing.quantity + (newItem.quantity || 1), newItem.stock);
          set({
            items: items.map((i) =>
              i.productId === newItem.productId && i.color === newItem.color && i.size === newItem.size
                ? { ...i, quantity: newQty }
                : i,
            ),
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: newItem.quantity || 1 }] });
        }
      },

      removeItem: (productId, color, size) => {
        set({ items: get().items.filter((i) => !(i.productId === productId && i.color === color && i.size === size)) });
      },

      updateQuantity: (productId, color, size, quantity) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.color === color && i.size === size
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'fashion-mall-cart' },
  ),
);
