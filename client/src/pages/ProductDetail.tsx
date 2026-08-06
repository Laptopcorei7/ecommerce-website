import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productsApi, reviewsApi } from "@/api";
import type { Product, Review } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import StarRating from "@/components/common/StarRating";
import Button from "@/components/common/Button";
import ProductCard from "@/components/product/ProductCard";
import { formatPrice, formatRelative, pluralize } from "@/lib/format";

const LOW_STOCK_THRESHOLD = 5;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const {
    isWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadReviews = useCallback(async (productId: string) => {
    try {
      const res = await reviewsApi.getByProduct(productId, { limit: 20 });
      setReviews(res.reviews ?? []);
      setReviewCount(res.totalReviews ?? 0);
    } catch (err) {
      console.error("Failed to load reviews for", productId, err);
      setReviews([]);
      setReviewCount(0);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setNotFound(false);
      // Reset per-product UI state; without this, navigating between products
      // keeps the previous item's selected image and quantity.
      setActiveImage(0);
      setQuantity(1);

      try {
        const res = await productsApi.getById(id);
        if (cancelled) return;
        setProduct(res.product);

        // Related items come from the same category, minus this one.
        productsApi
          .getAll({ category: res.product.category, limit: 5, page: 1 })
          .then((r) => {
            if (!cancelled) {
              setRelated(r.products.filter((p) => p._id !== id).slice(0, 4));
            }
          })
          .catch(() => {
            if (!cancelled) setRelated([]);
          });

        await loadReviews(id);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load product", id, err);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    window.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      cancelled = true;
    };
  }, [id, loadReviews]);

  function requireAccount() {
    navigate("/login", { state: { from: `/products/${id}` } });
  }

  async function handleAddToCart() {
    if (!isAuthenticated) return requireAccount();
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem(product._id, quantity);
      success(`${pluralize(quantity, "item")} added to your bag.`);
    } catch (err) {
      error((err as Error).message || "Could not add to bag.");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleWishlist() {
    if (!isAuthenticated) return requireAccount();
    if (!product) return;

    setWishlistPending(true);
    try {
      if (isWishlisted(product._id)) {
        await removeFromWishlist(product._id);
        success("Removed from saved.");
      } else {
        await addToWishlist(product._id);
        success("Saved.");
      }
    } catch (err) {
      error((err as Error).message || "Could not update saved items.");
    } finally {
      setWishlistPending(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !reviewTitle.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewsApi.create(id, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      // Refetch rather than prepending: the server recomputes the product's
      // average, and the created review comes back in a different shape.
      await loadReviews(id);
      const refreshed = await productsApi.getById(id);
      setProduct(refreshed.product);

      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      success("Thank you. Your review is published.");
    } catch (err) {
      error((err as Error).message || "Could not submit your review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (isLoading) return <Loading fullPage message="Loading" />;

  if (notFound || !product) {
    return (
      <div className="shell py-32 text-center">
        <p className="meta">404</p>
        <h1 className="display mt-4 text-ink-950">We don't stock that</h1>
        <p className="mx-auto mt-4 max-w-sm text-[16px] text-ink-600">
          The item may have been discontinued, or the link may be wrong.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Back to the index
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const soldOut = product.stock === 0;
  const low = !soldOut && product.stock <= LOW_STOCK_THRESHOLD;
  const wishlisted = isWishlisted(product._id);

  return (
    <div>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="shell flex items-center gap-2 border-b border-ink-950/12 py-4 font-mono text-meta uppercase text-ink-600"
      >
        <Link to="/" className="transition-colors hover:text-ink-950">
          Index
        </Link>
        <span aria-hidden>/</span>
        <Link
          to={`/?category=${product.category}`}
          className="transition-colors hover:text-ink-950"
        >
          {product.category}
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-ink-950">{product.name}</span>
      </nav>

      {/* ── Product ───────────────────────────────────────────────────────── */}
      <div className="shell grid gap-10 py-10 lg:grid-cols-12 lg:gap-14">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="well aspect-[4/5] border border-ink-950/12 sm:aspect-[4/3] lg:aspect-[4/5]">
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="animate-fade"
                key={images[activeImage]}
              />
            ) : (
              <div className="grid h-full place-items-center bg-paper-300">
                <span className="meta text-ink-600">No image</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1} of ${images.length}`}
                  aria-current={activeImage === i}
                  className={`well aspect-square w-20 border transition-colors ${
                    activeImage === i
                      ? "border-ink-950"
                      : "border-ink-950/12 hover:border-ink-950/40"
                  }`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail, sticks while the gallery scrolls */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <p className="meta">
              {product.category}
              {product.brand && ` · ${product.brand}`}
            </p>

            <h1 className="display mt-4 text-ink-950">{product.name}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-xl tabular text-ink-950">
                {formatPrice(product.price)}
              </span>
              {product.averageRating > 0 && (
                <span className="flex items-center gap-2">
                  <StarRating rating={product.averageRating} size="sm" />
                  <a
                    href="#reviews"
                    className="font-mono text-meta text-ink-600 underline-offset-4 hover:text-ink-950 hover:underline"
                  >
                    {product.averageRating.toFixed(1)} ·{" "}
                    {pluralize(reviewCount || product.totalReviews, "review")}
                  </a>
                </span>
              )}
            </div>

            <p className="mt-7 max-w-prose text-[16px] leading-relaxed text-ink-700">
              {product.description}
            </p>

            {/* Availability */}
            <p className="mt-7 flex items-center gap-2 font-mono text-meta uppercase">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  soldOut
                    ? "bg-ink-300"
                    : low
                      ? "bg-vermilion-600"
                      : "bg-ink-950"
                }`}
              />
              {soldOut
                ? "Sold out"
                : low
                  ? `Only ${product.stock} left`
                  : "In stock"}
            </p>

            {/* Purchase */}
            <div className="mt-6 border-t border-ink-950/12 pt-6">
              {soldOut ? (
                <div>
                  <Button disabled fullWidth size="lg">
                    Sold out
                  </Button>
                  <p className="mt-3 text-[15px] text-ink-600">
                    Save it and we'll show it in your list when it returns.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-12 items-center border border-ink-950/24">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="h-full w-11 text-ink-700 transition-colors hover:bg-ink-950/5 disabled:text-ink-400"
                    >
                      −
                    </button>
                    <span
                      aria-live="polite"
                      className="w-10 text-center font-mono text-[15px] tabular text-ink-950"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                      className="h-full w-11 text-ink-700 transition-colors hover:bg-ink-950/5 disabled:text-ink-400"
                    >
                      +
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    isLoading={addingToCart}
                    variant="brand"
                    size="lg"
                    className="flex-1"
                  >
                    Add to bag · {formatPrice(product.price * quantity)}
                  </Button>
                </div>
              )}

              <button
                type="button"
                onClick={handleWishlist}
                disabled={wishlistPending}
                aria-pressed={wishlisted}
                className="mt-4 font-mono text-meta uppercase text-ink-600 underline-offset-4 transition-colors hover:text-vermilion-600 hover:underline"
              >
                {wishlisted ? "Saved" : "Save for later"}
              </button>
            </div>

            {/* Standing terms: the same three facts as the home page */}
            <dl className="mt-8 grid grid-cols-1 gap-3 border-t border-ink-950/12 pt-6 text-[15px]">
              {[
                [
                  "Shipping",
                  "Free over $75, otherwise $6. Dispatched in 2 days.",
                ],
                ["Returns", "30 days, unused. We pay the return label."],
                ["Repairs", "Spares kept for everything we sell."],
              ].map(([term, detail]) => (
                <div key={term} className="flex gap-4">
                  <dt className="w-20 shrink-0 font-mono text-meta uppercase text-ink-600">
                    {term}
                  </dt>
                  <dd className="text-ink-600">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section
        id="reviews"
        className="shell scroll-mt-24 border-t border-ink-950/12 py-16"
      >
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="meta">Reviews</p>
            <h2 className="display-sm mt-3 text-ink-950">
              {reviewCount > 0
                ? `${product.averageRating.toFixed(1)} out of 5`
                : "No reviews yet"}
            </h2>
            {reviewCount > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <StarRating rating={product.averageRating} size="md" />
                <span className="font-mono text-meta uppercase text-ink-600">
                  {pluralize(reviewCount, "review")}
                </span>
              </div>
            )}

            {/* Write a review */}
            {isAuthenticated ? (
              <form
                onSubmit={handleSubmitReview}
                className="mt-8 border-t border-ink-950/12 pt-6"
              >
                <p className="meta-strong">Write a review</p>

                <div className="mt-4">
                  <span className="label">Rating</span>
                  <StarRating
                    rating={reviewRating}
                    size="lg"
                    interactive
                    onChange={setReviewRating}
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="review-title" className="label">
                    Headline
                  </label>
                  <input
                    id="review-title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={100}
                    required
                    placeholder="Sums it up in a few words"
                    className="field"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="review-body" className="label">
                    Your review
                  </label>
                  <textarea
                    id="review-body"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    required
                    placeholder="How has it held up?"
                    className="field h-auto resize-none py-2.5"
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={submittingReview}
                  className="mt-4"
                >
                  Publish review
                </Button>
              </form>
            ) : (
              <p className="mt-8 border-t border-ink-950/12 pt-6 text-[15px] text-ink-600">
                <Link to="/login" className="link font-medium">
                  Sign in
                </Link>{" "}
                to leave a review.
              </p>
            )}
          </div>

          {/* Review list */}
          <div className="lg:col-span-7 lg:col-start-6">
            {reviews.length === 0 ? (
              <p className="border border-ink-950/12 px-6 py-16 text-center text-[15px] text-ink-600">
                Nobody has reviewed this yet.
              </p>
            ) : (
              <ul className="divide-y divide-ink-950/12 border-y border-ink-950/12">
                {reviews.map((review) => (
                  <li key={review.id} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="font-mono text-meta-xs uppercase text-ink-600">
                        {formatRelative(review.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 text-[16px] font-medium tracking-tight text-ink-950">
                      {review.title}
                    </p>
                    <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-700">
                      {review.comment}
                    </p>

                    <p className="mt-3 flex items-center gap-2 font-mono text-meta-xs uppercase text-ink-600">
                      {review.user?.name ?? "Anonymous"}
                      {review.isVerifiedPurchase && (
                        <span className="text-ink-700">· Verified</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Related ───────────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="shell border-t border-ink-950/12 py-16">
          <p className="meta">Also in {product.category}</p>
          <h2 className="display-sm mt-3 text-ink-950">
            You might pair it with
          </h2>

          <div className="catalogue mt-8 grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
