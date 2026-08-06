import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "@/api";
import type { Order } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import { OrderStatusBadge } from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { formatExactPrice, formatDate, pluralize } from "@/lib/format";

/** Only these can still be called off by the customer. */
const CANCELLABLE = new Set(["pending", "processing"]);

export default function Orders() {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ordersApi
      .getUserOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.orders ?? []);
      })
      .catch((err) => {
        console.error("Failed to load orders", err);
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancel(id: string, orderNumber: string) {
    setCancelling(id);
    try {
      const res = await ordersApi.cancel(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
      success(`Order ${orderNumber} cancelled. Stock has been returned.`);
    } catch (err) {
      error((err as Error).message || "Could not cancel that order.");
    } finally {
      setCancelling(null);
    }
  }

  if (isLoading) return <Loading message="Loading your orders" />;

  if (orders.length === 0) {
    return (
      <div className="shell py-32 text-center">
        <p className="meta">Orders</p>
        <h1 className="display mt-4 text-ink-950">No orders yet</h1>
        <p className="mx-auto mt-4 max-w-sm text-[16px] leading-relaxed text-ink-600">
          When you place an order it will appear here, with its status and the
          address it's going to.
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
          <p className="meta">Orders</p>
          <h1 className="display-sm mt-3 text-ink-950">Your order history</h1>
        </div>
        <p className="shrink-0 font-mono text-meta uppercase tabular text-ink-600">
          {pluralize(orders.length, "order")}
        </p>
      </header>

      <ul className="divide-y divide-ink-950/12 border-b border-ink-950/12">
        {orders.map((order) => {
          const isOpen = expanded === order.id;
          const canCancel = CANCELLABLE.has(order.status);

          return (
            <li key={order.id}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-meta uppercase text-ink-950">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 font-mono text-meta-xs uppercase text-ink-600">
                    {formatDate(order.orderDate)} ·{" "}
                    {pluralize(order.itemCount, "item")}
                  </p>
                </div>

                <OrderStatusBadge status={order.status} />

                <span className="font-mono text-[15px] tabular text-ink-950">
                  {formatExactPrice(order.total)}
                </span>

                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  aria-expanded={isOpen}
                  className="font-mono text-meta uppercase text-ink-600 underline-offset-4 transition-colors hover:text-ink-950 hover:underline"
                >
                  {isOpen ? "Hide" : "Details"}
                </button>
              </div>

              {isOpen && (
                <div className="animate-rise grid gap-8 pb-8 md:grid-cols-2">
                  {/* Lines */}
                  <div>
                    <p className="meta">Items</p>
                    {order.items?.length ? (
                      <ul className="mt-3 space-y-2">
                        {order.items.map((item, i) => (
                          <li
                            key={`${order.id}-${i}`}
                            className="flex justify-between gap-4 text-[15px]"
                          >
                            <span className="text-ink-700">
                              {item.name}
                              <span className="text-ink-600">
                                {" "}
                                × {item.quantity}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono tabular text-ink-950">
                              {formatExactPrice(item.subtotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[15px] text-ink-600">
                        Line items aren't available for this order.
                      </p>
                    )}

                    <dl className="mt-4 space-y-1.5 border-t border-ink-950/12 pt-4 text-[15px]">
                      {order.subtotal !== undefined && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-600">Subtotal</dt>
                          <dd className="font-mono tabular text-ink-950">
                            {formatExactPrice(order.subtotal)}
                          </dd>
                        </div>
                      )}
                      {order.tax !== undefined && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-600">Tax</dt>
                          <dd className="font-mono tabular text-ink-950">
                            {formatExactPrice(order.tax)}
                          </dd>
                        </div>
                      )}
                      {order.shipping !== undefined && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-600">Shipping</dt>
                          <dd className="font-mono tabular text-ink-950">
                            {order.shipping === 0
                              ? "Free"
                              : formatExactPrice(order.shipping)}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-4 border-t border-ink-950/12 pt-1.5">
                        <dt className="font-medium text-ink-950">Total</dt>
                        <dd className="font-mono tabular text-ink-950">
                          {formatExactPrice(order.total)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Address + actions */}
                  <div>
                    <p className="meta">Shipping to</p>
                    <address className="mt-3 not-italic text-[15px] leading-relaxed text-ink-700">
                      {order.shippingAddress?.street}
                      <br />
                      {order.shippingAddress?.city}
                      {order.shippingAddress?.state &&
                        `, ${order.shippingAddress.state}`}
                      {order.shippingAddress?.zipCode &&
                        ` ${order.shippingAddress.zipCode}`}
                      <br />
                      {order.shippingAddress?.country}
                    </address>

                    {order.deliveryDate && (
                      <p className="mt-4 font-mono text-meta uppercase text-ink-600">
                        Delivered {formatDate(order.deliveryDate)}
                      </p>
                    )}

                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-5"
                        isLoading={cancelling === order.id}
                        onClick={() =>
                          handleCancel(order.id, order.orderNumber)
                        }
                      >
                        Cancel order
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
