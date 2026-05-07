import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, ordersApi } from "@/api";
import type { DashboardStats, Order } from "@/types";
import Loading from "@/components/common/Loading";
import { OrderStatusBadge } from "@/components/common/Badge";
import Select from "@/components/common/Select";
import { useToast } from "@/contexts/ToastContext";

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
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
    (async () => {
      setIsLoading(true);
      try {
        const [s, o] = await Promise.all([
          adminApi.getDashboard(),
          ordersApi.getAllOrders(),
        ]);
        setStats(s);
        setOrders(o.orders ?? []);
      } catch {
        // partial load is fine
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await ordersApi.updateStatus(orderId, status as any);
      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === orderId ? { ...o, status: updated.order.status } : o,
        ),
      );
      success("Order status updated");
    } catch (err) {
      error((err as Error).message || "Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) return <Loading fullPage message="Loading dashboard…" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Overview of your store's performance
          </p>
        </div>
        <Link
          to="/admin/products"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          Manage Products
        </Link>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Revenue"
            value={stats.revenue.total}
            color="bg-green-100 text-green-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            label="Total Orders"
            value={stats.overview.totalOrders}
            color="bg-blue-100 text-blue-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
          <StatCard
            label="Products"
            value={stats.overview.totalProducts}
            color="bg-purple-100 text-purple-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
          />
          <StatCard
            label="Users"
            value={stats.overview.totalUsers}
            color="bg-orange-100 text-orange-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">All Orders</h2>
          <span className="text-sm text-gray-400">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Date",
                  "Total",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400 text-sm"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {(order as any).customer?.name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date((order as any).orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ${order.total?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        options={ORDER_STATUS_OPTIONS}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        fullWidth={false}
                        className="w-36 text-xs"
                        disabled={updatingOrderId === order.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
