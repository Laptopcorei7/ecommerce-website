import type { OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", classes: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", classes: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", classes: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-800" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, classes } = statusConfig[status] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "blue" | "green" | "red" | "yellow" | "purple";
}

const colorMap = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function Badge({ children, color = "gray" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[color]}`}
    >
      {children}
    </span>
  );
}
