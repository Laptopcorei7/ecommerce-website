import type { OrderStatus } from "@/types";

/**
 * Status is carried by a coloured dot beside mono type, not by a pastel pill.
 * The dot is the only place colour is spent, which keeps five statuses legible
 * without introducing five new background tones to the palette.
 */
/**
 * The dot darkens as the order advances — clay while it is waiting on us,
 * vermilion while it is being worked, then ink through dispatch to delivered.
 * Cancelled fades out instead of progressing.
 *
 * Expressing five states as one darkening ramp keeps the palette closed. The
 * alternative — a green for "delivered", a blue for "shipped" — is how a
 * declared four-colour system quietly becomes seven.
 */
const statusConfig: Record<OrderStatus, { label: string; dot: string }> = {
  pending: { label: "Pending", dot: "bg-clay" },
  paid: { label: "Paid", dot: "bg-clay-dark" },
  processing: { label: "Processing", dot: "bg-vermilion-500" },
  shipped: { label: "Shipped", dot: "bg-ink-600" },
  delivered: { label: "Delivered", dot: "bg-ink-950" },
  cancelled: { label: "Cancelled", dot: "bg-ink-200" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, dot } = statusConfig[status] ?? {
    label: status,
    dot: "bg-ink-300",
  };

  return (
    <span className="inline-flex items-center gap-2 font-mono text-meta uppercase text-ink-700">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  /** Colour names are kept for call-site compatibility; all resolve into the
   *  ink/vermilion palette rather than Tailwind's stock pastels. */
  color?: "gray" | "blue" | "green" | "red" | "yellow" | "purple";
  /** Filled reads as a label printed onto the page; outline as an annotation. */
  variant?: "outline" | "filled";
}

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  gray: "text-ink-600 border-ink-950/20",
  blue: "text-ink-800 border-ink-950/30",
  green: "text-ink-950 border-ink-950/40",
  red: "text-vermilion-700 border-vermilion-700/35",
  yellow: "text-clay-dark border-clay-dark/50",
  purple: "text-ink-700 border-ink-950/25",
};

const filledMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  gray: "bg-ink-100 text-ink-700",
  blue: "bg-ink-800 text-paper-50",
  green: "bg-ink-950 text-paper-50",
  red: "bg-vermilion-600 text-paper-50",
  yellow: "bg-clay text-ink-950",
  purple: "bg-ink-700 text-paper-50",
};

export default function Badge({
  children,
  color = "gray",
  variant = "outline",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 font-mono text-meta-xs uppercase ${
        variant === "filled" ? filledMap[color] : `border ${colorMap[color]}`
      }`}
    >
      {children}
    </span>
  );
}
