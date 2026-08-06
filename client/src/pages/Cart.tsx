import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import { formatExactPrice, formatPrice, pluralize } from "@/lib/format";
import { priceOrder, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";

export default function Cart() {
  const { cart, isLoading, updateItem, removeItem, itemCount, total } =
    useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  // Totals come from the shared pricing rule, so the figure here is the figure
  // the order controller charges.
  const totals = priceOrder(total);

  async function handleRemove(id: string, name: string) {
    await removeItem(id);
    success(`Removed ${name}.`);
  }

  if (isLoading) return <Loading message="Loading your bag" />;

  if (!cart || cart.cart.length === 0) {
    return (
      <div className="shell py-32 text-center">
        <p className="meta">Your bag</p>
        <h1 className="display mt-4 text-ink-950">Nothing in it yet</h1>
        <p className="mx-auto mt-4 max-w-sm text-[16px] leading-relaxed text-ink-600">
          Forty-three things to choose from. It shouldn't take long.
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
          <p className="meta">Your bag</p>
          <h1 className="display-sm mt-3 text-ink-950">Ready when you are</h1>
        </div>
        <p className="shrink-0 font-mono text-meta uppercase tabular text-ink-600">
          {pluralize(itemCount, "item")}
        </p>
      </header>

      <div className="grid gap-12 py-10 lg:grid-cols-12 lg:gap-14">
        {/* ── Lines ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          {/* Free shipping progress */}
          <div className="border border-ink-950/12 p-4">
            <p className="text-[15px] text-ink-700">
              {totals.toFreeShipping > 0 ? (
                <>
                  <span className="font-mono tabular text-ink-950">
                    {formatExactPrice(totals.toFreeShipping)}
                  </span>{" "}
                  more for complimentary shipping
                </>
              ) : (
                <span className="font-medium text-ink-950">
                  Shipping is on us. You're over{" "}
                  {formatPrice(FREE_SHIPPING_THRESHOLD)}.
                </span>
              )}
            </p>
            <div
              role="progressbar"
              aria-valuenow={Math.round(totals.freeShippingProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress toward free shipping"
              className="mt-3 h-px w-full bg-ink-950/12"
            >
              <div
                className="h-full bg-vermilion-600 transition-[width] duration-500 ease-out"
                style={{ width: `${totals.freeShippingProgress * 100}%` }}
              />
            </div>
          </div>

          <ul className="mt-6 divide-y divide-ink-950/12 border-y border-ink-950/12">
            {cart.cart.map((item) => {
              const atStockLimit = item.quantity >= item.product.stock;
              return (
                <li key={item.id} className="flex gap-5 py-6">
                  <Link
                    to={`/products/${item.productId}`}
                    className="well aspect-[4/5] w-24 shrink-0 border border-ink-950/12"
                  >
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} />
                    ) : (
                      <span className="grid h-full place-items-center bg-paper-300" />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="meta">{item.product.category}</p>
                        <Link
                          to={`/products/${item.productId}`}
                          className="mt-1.5 block text-[16px] font-medium leading-snug tracking-tight text-ink-950 hover:text-vermilion-600"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <span className="shrink-0 font-mono text-[15px] tabular text-ink-950">
                        {formatExactPrice(item.subtotal)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                      <div className="flex h-9 items-center border border-ink-950/24">
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          className="h-full w-9 text-ink-700 transition-colors hover:bg-ink-950/5 disabled:text-ink-400"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-mono text-[15px] tabular text-ink-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={atStockLimit}
                          aria-label={`Increase quantity of ${item.product.name}`}
                          className="h-full w-9 text-ink-700 transition-colors hover:bg-ink-950/5 disabled:text-ink-400"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        {atStockLimit && (
                          <span className="font-mono text-meta-xs uppercase text-vermilion-600">
                            All {item.product.stock} in your bag
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(item.id, item.product.name)
                          }
                          className="font-mono text-meta uppercase text-ink-600 underline-offset-4 transition-colors hover:text-vermilion-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-24">
            <p className="meta">Summary</p>

            <dl className="mt-5 space-y-3 border-t border-ink-950/12 pt-5 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-600">
                  Subtotal · {pluralize(itemCount, "item")}
                </dt>
                <dd className="font-mono tabular text-ink-950">
                  {formatExactPrice(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-600">Estimated tax</dt>
                <dd className="font-mono tabular text-ink-950">
                  {formatExactPrice(totals.tax)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-600">Shipping</dt>
                <dd
                  className={`font-mono tabular ${
                    totals.shipping === 0 ? "text-ink-950" : "text-ink-700"
                  }`}
                >
                  {totals.shipping === 0
                    ? "Free"
                    : formatExactPrice(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-ink-950/12 pt-3">
                <dt className="font-medium text-ink-950">Total</dt>
                <dd className="font-mono text-base tabular text-ink-950">
                  {formatExactPrice(totals.total)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="btn-accent mt-6 w-full"
            >
              Checkout
            </button>

            <Link
              to="/"
              className="mt-4 block text-center font-mono text-meta uppercase text-ink-600 underline-offset-4 transition-colors hover:text-ink-950 hover:underline"
            >
              Keep looking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
