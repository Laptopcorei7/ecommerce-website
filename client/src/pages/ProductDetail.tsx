import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productsApi, reviewsApi, wishlistApi } from "@/api";
import type { Product, Review } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import StarRating from "@/components/common/StarRating";
import Button from "@/components/common/Button";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [tab, setTab] = useState<"description" | "reviews">("description");

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        const [prodRes, revs] = await Promise.all([
          productsApi.getById(id),
          reviewsApi.getByProduct(id),
        ]);
        setProduct(prodRes.product);
        setReviews(Array.isArray(revs) ? revs : []);

        // ← add this block
        if (isAuthenticated) {
          try {
            const wishlist = await wishlistApi.get();
            const isWishlisted = wishlist.items.some(
              (item) => item.product.id.toString() === id,
            );
            setWishlisted(isWishlisted);
          } catch {
            // Non-fatal: the page still works without the wishlist state.
          }
        }
      } catch (err) {
        console.error("Failed to load product", id, err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      error("Please log in to add items to cart");
      return;
    }
    if (!product) return;
    setAddingToCart(true);
    try {
      await addItem(product._id, quantity);
      success(`${quantity}× "${product.name}" added to cart`);
    } catch (err) {
      error((err as Error).message || "Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !product) {
      error("Please log in");
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await wishlistApi.remove(product._id);
        setWishlisted(false);
        success("Removed from wishlist");
      } else {
        await wishlistApi.add(product._id);
        setWishlisted(true);
        success("Added to wishlist");
      }
    } catch (err) {
      error((err as Error).message || "Could not update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newReview = await reviewsApi.create(id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviews((prev) => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      success("Review submitted!");
    } catch (err) {
      error((err as Error).message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) return <Loading fullPage message="Loading product…" />;
  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Product not found
        </h2>
        <Link
          to="/"
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          Back to shop
        </Link>
      </div>
    );

  const images = product.images?.length ? product.images : [];
  const isOutOfStock = product.stock === 0;
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">
          Home
        </Link>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-gray-400">{product.category}</span>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={
                images[activeImage] ||
                `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`
              }
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`;
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i
                      ? "border-primary-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {product.name}
            </h1>
          </div>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRating rating={avgRating} size="md" />
              <span className="text-sm text-gray-600 font-medium">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Out of Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                In Stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {!isOutOfStock && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
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
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                isLoading={addingToCart}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </Button>
              <div className="relative group/wishlist flex flex-col items-center gap-1">
                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    wishlisted
                      ? "border-red-300 bg-red-50 text-red-500"
                      : "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={wishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                <span className="text-[10px] text-gray-400 font-medium">
                  {wishlisted ? "Saved" : "Wishlist"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex border-b border-gray-200 gap-6">
          {(["description", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t} {t === "reviews" && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <div className="py-6 prose prose-sm max-w-none text-gray-700">
            <p>{product.description}</p>
          </div>
        )}

        {tab === "reviews" && (
          <div className="py-6 space-y-6">
            {/* Write review */}
            {isAuthenticated && (
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Write a Review
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    <StarRating
                      rating={reviewRating}
                      size="lg"
                      interactive
                      onChange={setReviewRating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      required
                      placeholder="Share your thoughts about this product…"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                    />
                  </div>
                  <Button type="submit" isLoading={submittingReview} size="sm">
                    Submit Review
                  </Button>
                </form>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No reviews yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                          {r.user?.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {r.user?.name ?? "Anonymous"}
                          </p>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
