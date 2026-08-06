import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ordersApi } from "@/api";
import type { Address } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { formatExactPrice, pluralize } from "@/lib/format";
import { priceOrder } from "@/lib/pricing";

type FormErrors = Partial<Record<keyof Address, string>>;

/**
 * Presentational only. This project has no payment provider wired up — the
 * order controller takes a shipping address and nothing else — so the choice
 * is recorded in the UI and the customer is told plainly that no payment is
 * collected.
 */
const PAYMENT_METHODS = [
  { id: "card", label: "Card", detail: "Visa, Mastercard, Amex" },
  { id: "paypal", label: "PayPal", detail: "Redirects to PayPal" },
  { id: "cod", label: "On delivery", detail: "Pay the courier" },
];

const FIELDS: {
  key: keyof Address;
  label: string;
  autoComplete: string;
  required: boolean;
  span?: boolean;
}[] = [
  {
    key: "street",
    label: "Street address",
    autoComplete: "street-address",
    required: true,
    span: true,
  },
  {
    key: "city",
    label: "City",
    autoComplete: "address-level2",
    required: true,
  },
  {
    key: "state",
    label: "State / region",
    autoComplete: "address-level1",
    required: true,
  },
  {
    key: "zipCode",
    label: "Postcode",
    autoComplete: "postal-code",
    required: true,
  },
  {
    key: "country",
    label: "Country",
    autoComplete: "country-name",
    required: true,
  },
];

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [errors, setErrors] = useState<FormErrors>({});

  const items = cart?.cart ?? [];
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const totals = priceOrder(items.reduce((s, i) => s + i.subtotal, 0));

  function validate(): boolean {
    const next: FormErrors = {};
    for (const field of FIELDS) {
      if (field.required && !address[field.key]?.trim()) {
        next[field.key] = `${field.label} is required.`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      error("There's nothing in your bag.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ordersApi.create({ shippingAddress: address });
      await refreshCart();
      success(`Order ${res.order.orderNumber} placed.`);
      navigate("/orders");
    } catch (err) {
      error((err as Error).message || "We couldn't place that order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="shell py-32 text-center">
        <p className="meta">Checkout</p>
        <h1 className="display mt-4 text-ink-950">Your bag is empty</h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-600">
          There's nothing to check out. Add something first.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Browse the index
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-12">
      <header className="border-b border-ink-950/12 pb-6">
        <p className="meta">Checkout</p>
        <h1 className="display-sm mt-3 text-ink-950">Where is it going?</h1>
      </header>

      <form
        onSubmit={handlePlaceOrder}
        className="grid gap-12 py-10 lg:grid-cols-12 lg:gap-14"
        noValidate
      >
        {/* ── Details ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          <fieldset>
            <legend className="meta-strong">Shipping address</legend>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <div
                  key={field.key}
                  className={field.span ? "sm:col-span-2" : undefined}
                >
                  <Input
                    label={field.label}
                    value={address[field.key] ?? ""}
                    onChange={(e) => {
                      setAddress((a) => ({
                        ...a,
                        [field.key]: e.target.value,
                      }));
                      // Clear the error as soon as they start fixing it.
                      setErrors((prev) =>
                        prev[field.key]
                          ? { ...prev, [field.key]: undefined }
                          : prev,
                      );
                    }}
                    autoComplete={field.autoComplete}
                    required={field.required}
                    error={errors[field.key]}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-10 border-t border-ink-950/12 pt-8">
            <legend className="meta-strong">Payment</legend>

            <div className="mt-5 grid gap-px border border-ink-950/12 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={`cursor-pointer p-4 outline-offset-[-2px] transition-colors ${
                      selected
                        ? "bg-ink-950 text-paper-50"
                        : "bg-paper-100 text-ink-950 hover:bg-paper-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selected}
                      onChange={() => setPaymentMethod(method.id)}
                      className="sr-only"
                    />
                    <span className="block font-mono text-meta uppercase">
                      {method.label}
                    </span>
                    <span
                      className={`mt-1.5 block text-[12px] ${
                        selected ? "text-paper-200" : "text-ink-500"
                      }`}
                    >
                      {method.detail}
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="mt-4 border-l-2 border-clay pl-3 text-[12px] leading-relaxed text-ink-500">
              This is a portfolio build. No payment is taken, no card details
              are requested, and nothing is stored. Placing the order writes a
              record and decrements stock, exactly as the real flow would.
            </p>
          </fieldset>
        </div>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-24">
            <p className="meta">Order · {pluralize(itemCount, "item")}</p>

            <ul className="mt-5 space-y-3 border-t border-ink-950/12 pt-5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 text-[13px]"
                >
                  <span className="text-ink-700">
                    {item.product.name}
                    <span className="text-ink-400"> × {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-mono tabular text-ink-950">
                    {formatExactPrice(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 border-t border-ink-950/12 pt-5 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-600">Subtotal</dt>
                <dd className="font-mono tabular text-ink-950">
                  {formatExactPrice(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-600">Tax</dt>
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

            <Button
              type="submit"
              variant="brand"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              className="mt-6"
            >
              Place order
            </Button>

            <Link
              to="/cart"
              className="mt-4 block text-center font-mono text-meta uppercase text-ink-500 underline-offset-4 transition-colors hover:text-ink-950 hover:underline"
            >
              Back to bag
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
