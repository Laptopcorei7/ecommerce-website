import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wishlistApi } from "@/api";
import type { WishlistItem } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);
  const { addItem } = useCart();
  const { success, error } = useToast();

  const fetchWishlist = () => {
    setIsLoading(true);
    wishlistApi
      .get()
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await wishlistApi.remove(productId);
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      success("Removed from wishlist");
    } catch (err) {
      error((err as Error).message || "Could not remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setCartLoadingId(item.product.id);
    try {
      await addItem(item.product.id);
      success(`"${item.product.name}" added to cart`);
    } catch (err) {
      error((err as Error).message || "Could not add to cart");
    } finally {
      setCartLoadingId(null);
    }
  };

  if (isLoading) return <Loading fullPage message="Loading wishlist…" />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        {items.length > 0 && (
          <p className="text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 mx-auto text-gray-200 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 mt-1 text-sm">
            Save items you love by clicking the heart icon.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const image =
              item.product.images?.[0] ||
              `https://placehold.co/300x220/e2e8f0/64748b?text=${encodeURIComponent(item.product.name)}`;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col"
              >
                <Link
                  to={`/products/${item.product.id}`}
                  className="relative block overflow-hidden bg-gray-50 aspect-[4/3]"
                >
                  <img
                    src={image}
                    alt={item.product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/300x220/e2e8f0/64748b?text=P`;
                    }}
                  />
                  {item.product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">
                      {item.product.category}
                    </p>
                    <Link
                      to={`/products/${item.product.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ${item.product.price.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      isLoading={cartLoadingId === item.product.id}
                      disabled={item.product.stock === 0}
                      size="sm"
                      className="flex-1"
                    >
                      Add to Cart
                    </Button>
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      disabled={removingId === item.product.id}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
