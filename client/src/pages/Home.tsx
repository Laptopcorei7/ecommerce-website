import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productsApi } from "@/api";
import type { Product, ProductFilters } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/common/Loading";
import Pagination from "@/components/common/Pagination";
import { EDITORIAL, editorialUrl } from "@/lib/editorial";
import { formatPrice, pluralize } from "@/lib/format";

const CATEGORIES = [
  "All",
  "Home",
  "Clothing",
  "Electronics",
  "Books",
  "Sports",
  "Other",
];

const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "-createdAt", label: "Newest" },
  { value: "-averageRating", label: "Best rated" },
  { value: "price", label: "Price, low to high" },
  { value: "-price", label: "Price, high to low" },
];

const PER_PAGE = 12;

/** Collection blocks. Each is a saved filter, presented as an editorial tile. */
const COLLECTIONS = [
  {
    photo: EDITORIAL.table,
    eyebrow: "For the table",
    title: "Stoneware & glass",
    copy: "Bowls, mugs and carafes fired in small batches. The pieces that get used every day rather than kept for guests.",
    to: "/?category=Home",
  },
  {
    photo: EDITORIAL.layering,
    eyebrow: "Cold weather",
    title: "Boots & outerwear",
    copy: "Leather that takes a resole and cotton that gets better wet. Built for a decade, not a season.",
    to: "/?category=Clothing",
  },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Listing state ────────────────────────────────────────────────────────
  const activeCategory = searchParams.get("category") ?? "All";
  const activeSort = searchParams.get("sort") ?? "";
  const activeSearch = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);

  const [searchDraft, setSearchDraft] = useState(activeSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Arrivals rail ────────────────────────────────────────────────────────
  const [arrivals, setArrivals] = useState<Product[]>([]);

  // Keep the visible search box in step when the query string changes from
  // somewhere else — a footer link, or the back button.
  useEffect(() => setSearchDraft(activeSearch), [activeSearch]);

  const filters: ProductFilters = useMemo(
    () => ({
      page,
      limit: PER_PAGE,
      category: activeCategory === "All" ? undefined : activeCategory,
      sort: (activeSort || undefined) as ProductFilters["sort"],
      search: activeSearch || undefined,
    }),
    [page, activeCategory, activeSort, activeSearch],
  );

  const fetchProducts = useCallback(async (f: ProductFilters) => {
    setIsLoading(true);
    try {
      const res = await productsApi.getAll(f);
      setProducts(res.products);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalProducts);
    } catch {
      setProducts([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  useEffect(() => {
    let cancelled = false;
    productsApi
      .getAll({ sort: "-createdAt", limit: 6, page: 1 })
      .then((res) => {
        if (!cancelled) setArrivals(res.products);
      })
      .catch(() => {
        if (!cancelled) setArrivals([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Merge into the query string so filters survive reload and back/forward. */
  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    // Any filter change invalidates the current page number.
    if (!("page" in next)) params.delete("page");
    setSearchParams(params);
  }

  const isFiltered =
    activeCategory !== "All" || Boolean(activeSearch) || Boolean(activeSort);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────
          A 12-column grid where the type block overlaps the left edge of the
          photograph. The overlap is what stops this reading as a stock
          two-column hero. */}
      <section className="relative border-b border-ink-950/12">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Photograph — bleeds to the right page edge. Both children are
              placed on row 1 so the type block can overlap the image rather
              than stacking above it. */}
          <div className="order-1 lg:order-2 lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <div className="well aspect-[4/3] lg:aspect-auto lg:h-[38rem]">
              <img
                src={editorialUrl(EDITORIAL.hero, 1800)}
                alt="Knitwear, denim and a watch laid out on a pale ground"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Type — sits on top of the photograph from lg up */}
          <div className="relative order-2 lg:order-1 lg:z-10 lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:self-center">
            <div className="bg-paper-100 px-5 py-12 sm:px-8 lg:max-w-xl lg:border lg:border-ink-950/12 lg:py-14 lg:pl-12 lg:pr-14">
              <p className="meta-accent">Established 2019 · Ships worldwide</p>

              <h1 className="display-lg mt-6 text-ink-950">
                Fewer things,
                <br />
                chosen slowly.
              </h1>

              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-700">
                We stock forty-three objects. Each one replaced something we had
                been using for years, and only after it turned out to be better.
                No sub-brands, no seasonal churn, no seventeen versions of a
                mug.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#index" className="btn-primary">
                  Browse the index
                </a>
                <Link
                  to="/?category=Home"
                  className="font-mono text-meta uppercase text-ink-600 underline-offset-4 transition-colors hover:text-vermilion-600 hover:underline"
                >
                  Start with the table →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Standing statements ────────────────────────────────────────────
          Three facts on a rule. Deliberately unequal: a 5/4/3 split with the
          type stepping down, so it reads as a masthead rather than the
          three-equal-columns feature row every storefront has. Shipping is
          the thing people actually want to know, so it gets the width. */}
      <section className="border-b border-ink-950/12">
        <dl className="shell grid grid-cols-1 divide-y divide-ink-950/12 md:grid-cols-12 md:divide-x md:divide-y-0">
          {[
            {
              n: "01",
              title: "Shipped in two days",
              copy: "From our own shelves, not a dropship warehouse. Tracked, and packed in paper.",
              span: "md:col-span-5",
              size: "text-[17px]",
            },
            {
              n: "02",
              title: "Thirty days to change your mind",
              copy: "Unused, in the box it arrived in. We pay the return.",
              span: "md:col-span-4",
              size: "text-[15px]",
            },
            {
              n: "03",
              title: "Repaired before replaced",
              copy: "We keep spares for everything we sell.",
              span: "md:col-span-3",
              size: "text-[14px]",
            },
          ].map(({ n, title, copy, span, size }) => (
            <div
              key={n}
              className={`${span} py-8 md:px-8 md:first:pl-0 md:last:pr-0`}
            >
              <dt className="flex items-baseline gap-3">
                <span className="font-mono text-meta-xs text-vermilion-600">
                  {n}
                </span>
                <span
                  className={`${size} font-medium tracking-tight text-ink-950`}
                >
                  {title}
                </span>
              </dt>
              <dd className="mt-2 pl-8 text-[13px] leading-relaxed text-ink-600">
                {copy}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Arrivals rail ──────────────────────────────────────────────────
          A horizontal scroller rather than another grid, so the page has two
          different reading rhythms before the index begins. */}
      {arrivals.length > 0 && (
        <section className="shell border-b border-ink-950/12 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="meta">Recently added</p>
              <h2 className="display-sm mt-3 text-ink-950">Just in</h2>
            </div>
            <Link
              to="/?sort=-createdAt"
              className="shrink-0 font-mono text-meta uppercase text-ink-600 underline-offset-4 transition-colors hover:text-ink-950 hover:underline"
            >
              See all →
            </Link>
          </div>

          <ul className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-px overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            {arrivals.map((product) => (
              <li
                key={product._id}
                className="w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-[22%]"
              >
                <Link
                  to={`/products/${product._id}`}
                  className="group block border border-ink-950/12 bg-paper-100 transition-colors hover:bg-paper-50"
                >
                  <div className="well aspect-[4/5]">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="meta">{product.category}</p>
                    <p className="mt-2 text-[14px] font-medium leading-snug tracking-tight text-ink-950 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="mt-2 font-mono text-[13px] tabular text-ink-700">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Collections ────────────────────────────────────────────────────
          Two unequal tiles. The second is offset downward so the pair reads as
          a spread rather than a row of cards. */}
      <section className="shell border-b border-ink-950/12 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {COLLECTIONS.map((collection, i) => (
            <Link
              key={collection.title}
              to={collection.to}
              className={`group block ${i === 1 ? "md:mt-20" : ""}`}
            >
              <div className="well aspect-[3/2] border border-ink-950/12">
                <img
                  src={editorialUrl(collection.photo, 1200, "3:2")}
                  alt=""
                  loading="lazy"
                  className="transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p className="meta-accent mt-5">{collection.eyebrow}</p>
              <h3 className="display-sm mt-2 text-2xl text-ink-950">
                {collection.title}
              </h3>
              <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-ink-600">
                {collection.copy}
              </p>
              <span className="mt-4 inline-block font-mono text-meta uppercase text-ink-950 underline-offset-4 group-hover:underline">
                Shop the collection →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── The index ──────────────────────────────────────────────────────
          The full catalogue, presented as a printed index: a ruled control bar,
          a running count, and a hairline grid. */}
      <section id="index" className="shell scroll-mt-24 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="meta">The index</p>
            <h2 className="display-sm mt-3 text-ink-950">
              {activeCategory === "All"
                ? "Everything we stock"
                : activeCategory}
            </h2>
          </div>
          <p className="shrink-0 font-mono text-meta uppercase tabular text-ink-500">
            {isLoading ? "—" : pluralize(totalItems, "item")}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-8 border-y border-ink-950/12">
          {/* Categories — a ruled row, not a strip of pills */}
          <div className="no-scrollbar flex items-stretch gap-6 overflow-x-auto py-3">
            {CATEGORIES.map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    updateParams({
                      category: category === "All" ? undefined : category,
                    })
                  }
                  aria-pressed={isActive}
                  className={`relative shrink-0 py-1 font-mono text-meta uppercase transition-colors ${
                    isActive
                      ? "text-ink-950"
                      : "text-ink-500 hover:text-ink-950"
                  }`}
                >
                  {category}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-0 h-px w-full bg-vermilion-600 transition-transform duration-300 ease-out ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Search + sort */}
          <div className="flex flex-col gap-3 border-t border-ink-950/12 py-3 sm:flex-row sm:items-center sm:justify-between">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ q: searchDraft || undefined });
              }}
              className="flex flex-1 items-center gap-2 sm:max-w-xs"
              role="search"
            >
              <label htmlFor="index-search" className="sr-only">
                Search the index
              </label>
              <input
                id="index-search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search"
                className="h-9 flex-1 border-0 border-b border-ink-950/20 bg-transparent px-0 font-mono text-meta uppercase text-ink-950 placeholder:text-ink-400 focus:border-ink-950 focus:outline-none focus:ring-0"
              />
              {activeSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft("");
                    updateParams({ q: undefined });
                  }}
                  className="font-mono text-meta uppercase text-ink-400 hover:text-vermilion-600"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="flex items-center gap-3">
              <label
                htmlFor="index-sort"
                className="font-mono text-meta uppercase text-ink-400"
              >
                Sort
              </label>
              <select
                id="index-sort"
                value={activeSort}
                onChange={(e) =>
                  updateParams({ sort: e.target.value || undefined })
                }
                className="h-9 cursor-pointer border-0 border-b border-ink-950/20 bg-transparent py-0 pl-0 pr-6 font-mono text-meta uppercase text-ink-950 focus:border-ink-950 focus:outline-none focus:ring-0"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10">
          {isLoading ? (
            <div className="catalogue grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-ink-950/12 px-6 py-24 text-center">
              <p className="meta">No results</p>
              <h3 className="display-sm mt-4 text-2xl text-ink-950">
                Nothing matches that
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-ink-600">
                We only stock forty-three things, so the index runs out quickly.
                Try a broader category.
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="btn-outline mt-8"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="catalogue grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={(page - 1) * PER_PAGE + i}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && !isLoading && (
          <div className="mt-12">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(next) => {
                updateParams({ page: next === 1 ? undefined : String(next) });
                document
                  .getElementById("index")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
