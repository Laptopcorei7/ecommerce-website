import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { wishlistApi } from "@/api";
import type { WishlistItem } from "@/types";
import { useAuth } from "./AuthContext";

interface WishlistContextValue {
  items: WishlistItem[];
  isLoading: boolean;
  // Fast O(1) lookup. Pass a product _id, get back whether it's wishlisted
  isWishlisted: (productId: string) => boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setWishlistedIds(new Set());
      return;
    }
    setIsLoading(true);
    try {
      const data = await wishlistApi.get();
      setItems(data.items);
      // Build a Set of product IDs for O(1) lookup in isWishlisted()
      // The backend returns product.id (not product._id). See wishlist controller
      setWishlistedIds(new Set(data.items.map((i) => String(i.product.id))));
    } catch {
      setItems([]);
      setWishlistedIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch once when auth state is known
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addItem = useCallback(
    async (productId: string) => {
      await wishlistApi.add(productId);
      // Optimistic update: add to Set immediately, no full refetch needed
      setWishlistedIds((prev) => new Set(prev).add(productId));
      // Refresh to get the full item shape (needed by Wishlist page)
      await refreshWishlist();
    },
    [refreshWishlist],
  );

  const removeItem = useCallback(async (productId: string) => {
    await wishlistApi.remove(productId);
    // Optimistic update: remove from Set immediately
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    setItems((prev) => prev.filter((i) => String(i.product.id) !== productId));
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistedIds.has(productId),
    [wishlistedIds],
  );

  const value: WishlistContextValue = {
    items,
    isLoading,
    isWishlisted,
    addItem,
    removeItem,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
