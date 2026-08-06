import { useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import { formatPrice, formatRelative, pluralize } from "@/lib/format";

export default function Wishlist() {
  const { items, isLoading, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { success, error } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleMoveToBag(productId: string, name: string) {
    setBusyId(productId);
    try {
      await addItem(productId, 1);
      await removeItem(productId);
      success(`${name} moved to your bag.`);
    } catch (err) {
      error((err as Error).message || "Could not move that to your bag.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(productId: string, name: string) {
    setBusyId(productId);
    try {
      await removeItem(productId);
      success(`Removed ${name}.`);
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <Loading message="Loading saved items" />;

  if (items.length === 0) {
    return (
      <div className="shell py-32 text-center">
        <p className="meta">Saved</p>
        <h1 className="display mt-4 text-ink-950">Nothing saved yet</h1>
        <p className="mx-auto mt-4 max-w-sm text-[16px] leading-relaxed text-ink-600">
          Save anything you're undecided about and it will wait here — including
          things that are currently sold out.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Browse the index
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-12">
      <header className="flex items-end justify-between gap-6 border-b border-ink-950/12 pb-6">
        <div>
          <p className="meta">Saved</p>
          <h1 className="display-sm mt-3 text-ink-950">
            Things you're weighing up
          </h1>
        </div>
        <p className="shrink-0 font-mono text-meta uppercase tabular text-ink-600">
          {pluralize(items.length, "item")}
        </p>
      </header>

      <ul className="divide-y divide-ink-950/12 border-b border-ink-950/12">
        {items.map(({ id, product, addedAt }) => {
          const soldOut = product.stock === 0;
          const busy = busyId === product.id;

          return (
            <li key={id} className="flex flex-wrap gap-5 py-6 sm:flex-nowrap">
              <Link
                to={`/products/${product.id}`}
                className="well aspect-[4/5] w-28 shrink-0 border border-ink-950/12"
              >
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <span className="grid h-full place-items-center bg-paper-300" />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="meta">
                      {product.category}
                      {product.brand && ` · ${product.brand}`}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="mt-1.5 block text-[16px] font-medium leading-snug tracking-tight text-ink-950 hover:text-vermilion-600"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 font-mono text-meta-xs uppercase text-ink-600">
                      Saved {formatRelative(addedAt)}
                    </p>
                  </div>

                  <span className="shrink-0 font-mono text-[15px] tabular text-ink-950">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-4">
                  {soldOut ? (
                    <span className="font-mono text-meta uppercase text-ink-600">
                      Sold out — we'll restock
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product.id, product.name)}
                      disabled={busy}
                      className="btn-outline btn-sm"
                    >
                      {busy ? "Moving…" : "Move to bag"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(product.id, product.name)}
                    disabled={busy}
                    className="font-mono text-meta uppercase text-ink-600 underline-offset-4 transition-colors hover:text-vermilion-600 hover:underline disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
