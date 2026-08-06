import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  /** Position in the listing. Printed as the catalogue index on the image. */
  index?: number;
  onWishlistChange?: () => void;
}

/** Below this, the card says how many are left instead of just "in stock". */
const LOW_STOCK_THRESHOLD = 5;

export default function ProductCard({
  product,
  index,
  onWishlistChange,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const {
    isWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();

  const [adding, setAdding] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const soldOut = product.stock === 0;
  const low = !soldOut && product.stock <= LOW_STOCK_THRESHOLD;

  // The gallery holds three crops of the same photograph. Showing the second
  // on hover gives the grid life without needing a second shoot.
  const primary = product.images?.[0];
  const secondary = product.images?.[1];

  /** Both actions require an account; send guests to sign in and come back. */
  function requireAccount() {
    navigate("/login", { state: { from: `/products/${product._id}` } });
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return requireAccount();

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
    if (!isAuthenticated) return requireAccount();

    setWishlistPending(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
      onWishlistChange?.();
    } finally {
      setWishlistPending(false);
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group relative flex flex-col bg-paper-100 transition-colors duration-300 hover:bg-paper-50"
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div className="well aspect-[4/5]">
        {primary && !imgFailed ? (
          <>
            <img
              src={primary}
              alt={product.name}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className={`transition-[opacity,transform] duration-[900ms] ease-out
                          group-hover:scale-[1.03]
                          ${secondary ? "group-hover:opacity-0" : ""}`}
            />
            {secondary && (
              <img
                src={secondary}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 opacity-0 transition-[opacity,transform]
                           duration-[900ms] ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-paper-300">
            <span className="meta text-ink-400">No image</span>
          </div>
        )}

        {/* Stock state. Only shown when it's actually worth saying. */}
        {soldOut && (
          <span className="absolute right-3 top-3 bg-ink-950 px-2 py-1 font-mono text-meta-xs uppercase text-paper-50">
            Sold out
          </span>
        )}
        {low && (
          <span className="absolute right-3 top-3 bg-vermilion-600 px-2 py-1 font-mono text-meta-xs uppercase text-paper-50">
            {product.stock} left
          </span>
        )}

        {/* Wishlist — a ruled square, not a floating white pill. */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistPending}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          className={`absolute bottom-3 right-3 grid h-8 w-8 place-items-center border
                      transition-all duration-200 ease-out
                      ${
                        wishlisted
                          ? "border-ink-950 bg-ink-950 text-paper-50 opacity-100"
                          : "border-ink-950/24 bg-paper-50 text-ink-700 opacity-0 hover:border-ink-950 group-hover:opacity-100 focus-visible:opacity-100"
                      }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill={wishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.6}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      {/* ── Detail ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          {/* Index sits with the category rather than on the photograph, where
              it disappeared against dark images. */}
          <span className="meta">
            {index !== undefined && (
              <span className="text-ink-300">
                {String(index + 1).padStart(3, "0")} ·{" "}
              </span>
            )}
            {product.category}
          </span>
          {product.averageRating > 0 && (
            <span className="font-mono text-meta-xs tabular text-ink-400">
              {product.averageRating.toFixed(1)} · {product.totalReviews}
            </span>
          )}
        </div>

        <h3 className="mt-2 text-[15px] font-medium leading-snug tracking-tight text-ink-950 line-clamp-2">
          {product.name}
        </h3>

        {product.brand && (
          <p className="mt-0.5 text-[13px] text-ink-500">{product.brand}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="font-mono text-sm tabular text-ink-950">
            {formatPrice(product.price)}
          </span>

          {!soldOut && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="font-mono text-meta uppercase text-ink-500 underline-offset-4
                         transition-colors duration-200 hover:text-vermilion-600 hover:underline
                         disabled:text-ink-300"
            >
              {adding ? "Adding" : "Add"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
