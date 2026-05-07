import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cartApi } from "@/api";
import type { Cart, CartItem } from "@/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  total: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCartLocally: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      await cartApi.addItem({ productId, quantity });
      // refresh cart from server to get accurate state
      await refreshCart();
    },
    [refreshCart],
  );

  const updateItem = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(id);
        return;
      }
      await cartApi.updateItem(id, { quantity });
      await refreshCart();
    },
    [refreshCart],
  );

  const removeItem = useCallback(async (id: string) => {
    await cartApi.removeItem(id);
    setCart((prev) => {
      if (!prev) return prev;
      const updatedCart = prev.cart.filter((i) => i.id !== id);
      return {
        cart: updatedCart,
        summary: {
          totalItems: updatedCart.reduce((s, i) => s + i.quantity, 0),
          totalPrice: updatedCart.reduce((s, i) => s + i.subtotal, 0),
        },
      };
    });
  }, []);

  const clearCartLocally = useCallback(() => setCart(null), []);

  const value: CartContextValue = {
    cart,
    isLoading,
    itemCount: cart?.summary.totalItems ?? 0,
    total: cart?.summary.totalPrice ?? 0,
    addItem,
    updateItem,
    removeItem,
    refreshCart,
    clearCartLocally,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
