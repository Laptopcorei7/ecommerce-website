/**
 * Display formatting.
 *
 * Every price, date and count the storefront renders goes through here, so
 * currency and locale live in one place rather than being re-implemented as
 * `$${n.toFixed(2)}` across twenty components.
 */

const LOCALE = "en-US";
const CURRENCY = "USD";

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole-dollar amounts drop the cents — $148, not $148.00. */
const wholePriceFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a price. Catalogue prices are mostly whole dollars, and a grid full
 * of trailing `.00` reads as noise, so those are shown without cents.
 */
export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) return priceFormatter.format(0);
  return Number.isInteger(amount)
    ? wholePriceFormatter.format(amount)
    : priceFormatter.format(amount);
}

/** Always shows cents. Use for totals, line items and anything on a receipt. */
export function formatExactPrice(amount: number): string {
  return priceFormatter.format(Number.isFinite(amount) ? amount : 0);
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["week", 604_800_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: "auto",
});

/** "3 days ago" — used on reviews and order history. */
export function formatRelative(
  value: string | Date | undefined | null,
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const elapsed = date.getTime() - Date.now();
  const magnitude = Math.abs(elapsed);

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (magnitude >= ms) {
      return relativeFormatter.format(Math.round(elapsed / ms), unit);
    }
  }
  return "just now";
}

/** Order numbers and ids, shortened for display without losing the tail. */
export function shortId(id: string, length = 8): string {
  return id.length <= length ? id : `…${id.slice(-length)}`;
}

/** "3 items" / "1 item" — avoids the "1 items" that plagues cart summaries. */
export function pluralize(count: number, singular: string, plural?: string) {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${word}`;
}
