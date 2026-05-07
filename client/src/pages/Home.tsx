import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "@/api";
import type { Product, ProductFilters } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/common/Loading";
import Pagination from "@/components/common/Pagination";

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Home",
  "Sports",
  "Other",
];
const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "-createdAt", label: "Newest" },
  { value: "price", label: "Price: Low → High" },
  { value: "-price", label: "Price: High → Low" },
  { value: "-name", label: "Name: Z → A" },
];

// ── Hero slideshow card ───────────────────────────────────────
// Full-bleed image card used inside the Hero slideshow.
// Lightweight — no cart/wishlist logic. Links to product page.
function HeroSlideCard({
  product,
  visible,
}: {
  product: Product;
  visible: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/products/${product._id}`}
      className="absolute inset-0 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden bg-white/5">
        {product.images?.[0] && !imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
            <svg
              className="w-16 h-16 text-white/20 mb-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
              />
            </svg>
            <span className="text-white/30 text-sm">{product.name}</span>
          </div>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-b-3xl">
          {product.category && (
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest mb-1">
              {product.category}
            </p>
          )}
          <p className="text-white text-sm font-medium leading-snug line-clamp-2 mb-2">
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            {product.averageRating > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className={`w-3 h-3 ${
                        s <= Math.round(product.averageRating)
                          ? "text-brand-400"
                          : "text-white/25"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/50 text-[11px]">
                  {product.averageRating.toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="text-white/30 text-[11px]">No reviews yet</span>
            )}
            <span className="text-brand-300 text-sm font-semibold">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  // ── Hero slideshow ──
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const isPaused = useRef(false);

  useEffect(() => {
    async function fetchHeroProducts() {
      try {
        const res = await productsApi.getAll({
          sort: "-averageRating",
          limit: 4,
          page: 1,
        });
        setHeroProducts(res.products);
      } catch {
        setHeroProducts([]);
      } finally {
        setHeroLoading(false);
      }
    }
    fetchHeroProducts();
  }, []);

  // Auto-advance every 3.5s — pauses on hover via isPaused ref
  useEffect(() => {
    if (heroProducts.length < 2) return;
    const interval = setInterval(() => {
      if (!isPaused.current) {
        setHeroIndex((i) => (i + 1) % heroProducts.length);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [heroProducts.length]);

  const goPrev = () =>
    setHeroIndex((i) => (i - 1 + heroProducts.length) % heroProducts.length);
  const goNext = () => setHeroIndex((i) => (i + 1) % heroProducts.length);

  // ── Main product listing ──
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
  });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = useCallback(async (f: ProductFilters) => {
    setIsLoading(true);
    try {
      const res = await productsApi.getAll(f);
      setProducts(res.products);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalProducts);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1, search: search || undefined }));
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setFilters((f) => ({
      ...f,
      page: 1,
      category: cat === "All" ? undefined : cat,
    }));
  };

  const handleSort = (value: string) => {
    setFilters((f) => ({
      ...f,
      page: 1,
      sort: (value || undefined) as ProductFilters["sort"],
    }));
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-950 pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-brand-600 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ── Left: Hero copy + search ── */}
            <div>
              <span className="tag bg-brand-600/20 text-brand-300 mb-6 inline-block">
                New Season Arrivals
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-semibold text-white leading-[1.05] mb-6">
                Discover
                <br />
                <em className="text-brand-400 not-italic">Premium</em>
                <br />
                Quality
              </h1>
              <p className="text-ink-300 text-lg max-w-xl leading-relaxed mb-10">
                Curated collections of the finest products, delivered with care.
                Shop the latest arrivals and exclusive offers.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-brand !rounded-full px-6 whitespace-nowrap"
                >
                  Search
                </button>
              </form>
            </div>

            {/* ── Right: Slideshow ── */}
            <div className="hidden lg:flex flex-col gap-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
                  Top Rated
                </p>
                {!heroLoading && heroProducts.length > 0 && (
                  <span className="text-white/30 text-xs tabular-nums">
                    {heroIndex + 1} / {heroProducts.length}
                  </span>
                )}
              </div>

              {/* Slide container */}
              <div
                className="relative w-full rounded-3xl"
                style={{ height: "340px" }}
                onMouseEnter={() => {
                  isPaused.current = true;
                }}
                onMouseLeave={() => {
                  isPaused.current = false;
                }}
              >
                {heroLoading ? (
                  <div className="absolute inset-0 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                ) : heroProducts.length > 0 ? (
                  heroProducts.map((p, i) => (
                    <HeroSlideCard
                      key={p._id}
                      product={p}
                      visible={i === heroIndex}
                    />
                  ))
                ) : (
                  <div className="absolute inset-0 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-white/20 text-sm">
                      No products yet
                    </span>
                  </div>
                )}

                {/* Prev / Next arrows */}
                {!heroLoading && heroProducts.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Dot indicators + View all */}
              <div className="flex items-center justify-between">
                {!heroLoading && heroProducts.length > 1 ? (
                  <div className="flex items-center gap-1.5">
                    {heroProducts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className="transition-all duration-300 rounded-full bg-white/25"
                        style={{
                          width: i === heroIndex ? "20px" : "6px",
                          height: "6px",
                          opacity: i === heroIndex ? 1 : 0.4,
                          backgroundColor:
                            i === heroIndex
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(255,255,255,0.3)",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span />
                )}

                <Link
                  to="/products"
                  className="text-brand-400 text-xs hover:text-brand-300 transition-colors duration-200 flex items-center gap-1"
                >
                  View all
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-white text-xs tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-px h-8 bg-white/50 animate-pulse" />
        </div>
      </section>

      {/* ── Category Chips ───────────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-ink-950 text-white shadow-sm"
                    : "bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="section-title text-2xl">
              {activeCategory === "All" ? "All Products" : activeCategory}
            </h2>
            {!isLoading && (
              <p className="section-subtitle text-sm">{totalItems} items</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min $"
                className="w-20 px-3 py-2 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-950 focus:ring-1 focus:ring-ink-950/10"
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    page: 1,
                    minPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
              <span className="text-ink-300 text-xs">—</span>
              <input
                type="number"
                placeholder="Max $"
                className="w-20 px-3 py-2 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-950 focus:ring-1 focus:ring-ink-950/10"
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    page: 1,
                    maxPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            <select
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2 text-sm border border-ink-200 rounded-xl focus:outline-none focus:border-ink-950 bg-white text-ink-700 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-ink-100 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-9 h-9 text-ink-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-ink-700 mb-2">
              No products found
            </h3>
            <p className="text-ink-400 text-sm mb-6">
              Try a different search or category
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setFilters({ page: 1, limit: 12 });
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && !isLoading && (
          <div className="mt-12 flex justify-center">
            <Pagination
              page={filters.page ?? 1}
              totalPages={totalPages}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </div>
        )}
      </section>

      {/* ── Value Props Banner ───────────────────────────────────── */}
      <section className="bg-ink-50 border-y border-ink-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                desc: "On orders over $50",
              },
              {
                icon: "↩️",
                title: "Easy Returns",
                desc: "30-day return policy",
              },
              {
                icon: "🔒",
                title: "Secure Checkout",
                desc: "SSL encrypted payments",
              },
              {
                icon: "⭐",
                title: "Premium Quality",
                desc: "Curated collections",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
