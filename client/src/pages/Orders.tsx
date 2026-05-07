import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "@/api";
import type { Order } from "@/types";
import Loading from "@/components/common/Loading";
import { OrderStatusBadge } from "@/components/common/Badge";
import { useToast } from "@/contexts/ToastContext";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<string, Order>>({});
  const { success, error } = useToast();

  useEffect(() => {
    ordersApi
      .getUserOrders()
      .then((data) => setOrders(data.orders)) // ← unwrap the orders array
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loading fullPage message="Loading orders…" />;

  const handleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!orderDetails[orderId]) {
      try {
        const res = await ordersApi.getById(orderId);
        setOrderDetails((prev) => ({ ...prev, [orderId]: res.order }));
      } catch {
        // silently fail
      }
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await ordersApi.cancel(orderId);
      // update the order status in local state
      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === orderId ? { ...o, status: "cancelled" } : o,
        ),
      );
      setOrderDetails((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], status: "cancelled" },
      }));
      success("Order cancelled successfully");
    } catch (err) {
      error((err as Error).message || "Failed to cancel order");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 mx-auto text-gray-200 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No orders yet</h3>
          <p className="text-gray-500 mt-1 text-sm">
            Your orders will appear here once you make a purchase.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                {/* Order header */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExpand(String(order.id))}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.orderNumber}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-400">
                      Placed on{" "}
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-900">
                        ${order.total?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Items</p>
                      <p className="font-semibold text-gray-700">
                        {order.itemCount ?? 0}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5">
                    {orderDetails[String(order.id)] ? (
                      <>
                        {/* Items */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-700">
                            Items
                          </h3>
                          {orderDetails[String(order.id)].items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Qty: {item.quantity} × $
                                  {item.price?.toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                ${item.subtotal?.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Shipping address */}
                        {orderDetails[String(order.id)].shippingAddress && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                              Shipping Address
                            </h3>
                            <p className="text-sm text-gray-600">
                              {
                                orderDetails[String(order.id)].shippingAddress
                                  .street
                              }
                              ,{" "}
                              {
                                orderDetails[String(order.id)].shippingAddress
                                  .city
                              }
                              ,{" "}
                              {
                                orderDetails[String(order.id)].shippingAddress
                                  .country
                              }
                            </p>
                          </div>
                        )}

                        {/* Totals */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>
                              $
                              {orderDetails[String(order.id)].subtotal?.toFixed(
                                2,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Tax</span>
                            <span>
                              ${orderDetails[String(order.id)].tax?.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>
                              $
                              {orderDetails[String(order.id)].shipping?.toFixed(
                                2,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>
                              $
                              {orderDetails[String(order.id)].total?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {["pending", "paid"].includes(
                          orderDetails[String(order.id)]?.status,
                        ) && (
                          <button
                            onClick={() => handleCancel(String(order.id))}
                            className="w-full mt-2 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Loading order details...
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
