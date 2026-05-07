import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  product: Product;
  onWishlistChange?: () => void;
}

export default function ProductCard({
  product,
  onWishlistChange,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const {
    isWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = 0;
  // Derive wishlisted state from context — reflects real server state on mount
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setAdding(true);
    try {
      await addItem(product._id, 1);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
      onWishlistChange?.();
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-ink-50 aspect-[3/4]">
        {/* Product Image */}
        {product.images?.[0] && !imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200 text-ink-400">
            <svg
              className="w-12 h-12 mb-2 opacity-40"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="text-xs opacity-50">{product.name}</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2.5 py-1 bg-ink-800/80 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 hover:bg-white"
        >
          <svg
            className={`w-4 h-4 transition-colors duration-200 ${
              wishlisted
                ? "fill-red-500 stroke-red-500"
                : "fill-none stroke-ink-400 hover:stroke-red-400"
            }`}
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Add to cart — slides up on hover */}
        {product.stock > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full py-2.5 bg-ink-950/90 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-ink-950 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {adding ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              )}
              {adding ? "Adding…" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 px-0.5">
        {product.category && (
          <p className="text-[11px] font-medium text-ink-400 uppercase tracking-widest mb-1">
            {product.category}
          </p>
        )}
        <h3 className="text-sm font-medium text-ink-900 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product.averageRating)
                      ? "text-brand-500"
                      : "text-ink-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {product.totalReviews > 0 && (
              <span className="text-[11px] text-ink-400">
                ({product.totalReviews})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-sm font-semibold text-ink-950">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
