import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, ordersApi } from "@/api";
import type { DashboardStats, Order, OrderStatus } from "@/types";
import Loading from "@/components/common/Loading";
import { OrderStatusBadge } from "@/components/common/Badge";
import { useToast } from "@/contexts/ToastContext";
import { formatDate, formatExactPrice } from "@/lib/format";

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/**
 * A figure with its label above it, separated by rules. The admin view is the
 * one place in the design where density is the point, so the numbers are set
 * large in mono and everything around them is quiet.
 */
function Figure({
  label,
  value,
  note,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  note?: string;
  tone?: "ink" | "accent";
}) {
  return (
    <div className="px-5 py-6 first:pl-0">
      <p className="meta">{label}</p>
      <p
        className={`mt-3 font-mono text-3xl tabular leading-none ${
          tone === "accent" ? "text-vermilion-600" : "text-ink-950"
        }`}
      >
        {value}
      </p>
      {note && <p className="mt-2 text-[13px] text-ink-600">{note}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Settled rather than all: a failure in one panel shouldn't blank the
        // other. The dashboard is more useful half-loaded than not at all.
        const [statsRes, ordersRes] = await Promise.allSettled([
          adminApi.getDashboard(),
          ordersApi.getAllOrders(),
        ]);

        if (cancelled) return;

        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        else console.error("Dashboard stats failed", statsRes.reason);

        if (ordersRes.status === "fulfilled")
          setOrders(ordersRes.value.orders ?? []);
        else console.error("Order list failed", ordersRes.reason);

        if (statsRes.status === "rejected" && ordersRes.status === "rejected") {
          error("Could not load the dashboard.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [error]);

  async function handleStatusChange(id: string, status: OrderStatus) {
    setUpdatingOrderId(id);
    try {
      const res = await ordersApi.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
      success(`Order ${res.order.orderNumber} marked ${status}.`);
    } catch (err) {
      error((err as Error).message || "Could not update that order.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (isLoading) return <Loading message="Loading dashboard" />;

  const overview = stats?.overview;
  const needsAttention =
    (overview?.pendingOrders ?? 0) +
    (overview?.lowStockProducts ?? 0) +
    (overview?.outOfStockProducts ?? 0);

  return (
    <div className="shell py-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-ink-950/12 pb-6">
        <div>
          <p className="meta-accent">Administration</p>
          <h1 className="display-sm mt-3 text-ink-950">Shop overview</h1>
        </div>
        <Link to="/admin/products" className="btn-outline btn-sm">
          Manage catalogue
        </Link>
      </header>

      {/* ── Figures ───────────────────────────────────────────────────────── */}
      {stats && (
        <>
          <section className="grid grid-cols-2 divide-x divide-ink-950/12 border-b border-ink-950/12 lg:grid-cols-4">
            {/* The dashboard endpoint returns revenue already formatted as a
                currency string ("$1,414.61"), so these render as-is. Wrapping
                them in another $ produced "$$1,414.61". */}
            <Figure
              label="Revenue"
              value={stats.revenue.total}
              note={`Average order ${stats.revenue.averageOrderValue}`}
            />
            <Figure
              label="Orders"
              value={overview?.totalOrders ?? 0}
              note={`${stats.thisMonth.orders} this month · ${stats.thisMonth.orderGrowth} growth`}
            />
            <Figure
              label="Customers"
              value={overview?.totalUsers ?? 0}
              note={`${stats.today.newUsers} joined today`}
            />
            <Figure
              label="Reviews"
              value={overview?.totalReviews ?? 0}
              note={`${stats.today.newReviews} written today`}
            />
          </section>

          <section className="grid grid-cols-2 divide-x divide-ink-950/12 border-b border-ink-950/12 lg:grid-cols-4">
            <Figure
              label="Awaiting action"
              value={needsAttention}
              tone={needsAttention > 0 ? "accent" : "ink"}
              note="Pending orders and stock issues"
            />
            <Figure
              label="Pending orders"
              value={overview?.pendingOrders ?? 0}
              tone={(overview?.pendingOrders ?? 0) > 0 ? "accent" : "ink"}
            />
            <Figure
              label="Low stock"
              value={overview?.lowStockProducts ?? 0}
              note="Five units or fewer"
            />
            <Figure
              label="Sold out"
              value={overview?.outOfStockProducts ?? 0}
              tone={(overview?.outOfStockProducts ?? 0) > 0 ? "accent" : "ink"}
            />
          </section>
        </>
      )}

      {/* ── Orders ────────────────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="meta">Orders</p>
            <h2 className="display-sm mt-3 text-2xl text-ink-950">
              Everything placed
            </h2>
          </div>
          <p className="shrink-0 font-mono text-meta uppercase tabular text-ink-600">
            {orders.length} total
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="mt-8 border border-ink-950/12 px-6 py-16 text-center text-[15px] text-ink-600">
            No orders have been placed yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse">
              <thead>
                <tr className="border-y border-ink-950/12 text-left">
                  {["Order", "Placed", "Items", "Total", "Status", ""].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="py-3 pr-6 font-mono text-meta font-normal uppercase text-ink-600"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-950/12">
                {orders.map((order) => (
                  <tr key={order.id} className="align-middle">
                    <td className="py-4 pr-6 font-mono text-[15px] text-ink-950">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 pr-6 font-mono text-[15px] tabular text-ink-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-4 pr-6 font-mono text-[15px] tabular text-ink-600">
                      {order.itemCount}
                    </td>
                    <td className="py-4 pr-6 font-mono text-[15px] tabular text-ink-950">
                      {formatExactPrice(order.total)}
                    </td>
                    <td className="py-4 pr-6">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-4">
                      <label className="sr-only" htmlFor={`status-${order.id}`}>
                        Change status of {order.orderNumber}
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as OrderStatus,
                          )
                        }
                        className="h-9 cursor-pointer border border-ink-950/16 bg-paper-50 px-2 font-mono text-meta uppercase text-ink-950 focus:border-ink-950 focus:outline-none disabled:opacity-40"
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
