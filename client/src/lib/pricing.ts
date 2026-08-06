/**
 * Order pricing, mirrored from `server/src/lib/pricing.js`.
 *
 * The storefront needs these to show a running total without a round trip per
 * keystroke, but the server's copy is the one that is actually charged. Change
 * one and you must change the other, because a mismatch means the customer is quoted
 * a total they aren't billed.
 */

export const FREE_SHIPPING_THRESHOLD = 75;
export const SHIPPING_FLAT = 6;
export const TAX_RATE = 0.1;

/** Round to whole cents. Mirrors roundMoney() on the server. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  /** How much more the customer must spend to reach free shipping. */
  toFreeShipping: number;
  /** 0–1, for the free-shipping progress indicator. */
  freeShippingProgress: number;
}

export function priceOrder(rawSubtotal: number): OrderTotals {
  const subtotal = roundMoney(rawSubtotal);
  const tax = roundMoney(subtotal * TAX_RATE);
  const shipping = shippingFor(subtotal);

  return {
    subtotal,
    tax,
    shipping,
    total: roundMoney(subtotal + tax + shipping),
    toFreeShipping: Math.max(roundMoney(FREE_SHIPPING_THRESHOLD - subtotal), 0),
    freeShippingProgress: Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1),
  };
}
