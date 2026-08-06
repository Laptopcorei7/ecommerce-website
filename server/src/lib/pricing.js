/**
 * Order pricing: the single source of truth for what a customer is charged.
 *
 * These numbers previously lived in three places that disagreed: the cart page
 * promised free shipping over $50, the product page said $75, and the order
 * controller charged a flat $10 regardless. The customer saw one total and was
 * billed another.
 *
 * `client/src/lib/pricing.ts` mirrors these constants so the storefront can
 * show a running total without a round trip. If you change one, change both.
 * The server value is the one that is actually charged.
 */

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FLAT = 6;
const TAX_RATE = 0.1;

/**
 * Round to whole cents.
 *
 * Money in floats accumulates error: `48.6 * 0.1` is 4.8599999999999994, and
 * summing unrounded components produces totals that don't match the sum of the
 * lines shown to the customer. Every figure that gets stored or displayed goes
 * through here.
 */
function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function shippingFor(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

/**
 * Break a subtotal into the figures an order stores and a cart displays.
 * Tax is charged on goods only, not on shipping.
 */
function priceOrder(rawSubtotal) {
  const subtotal = roundMoney(rawSubtotal);
  const tax = roundMoney(subtotal * TAX_RATE);
  const shipping = shippingFor(subtotal);
  const total = roundMoney(subtotal + tax + shipping);

  return { subtotal, tax, shipping, total };
}

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  TAX_RATE,
  roundMoney,
  shippingFor,
  priceOrder,
};
