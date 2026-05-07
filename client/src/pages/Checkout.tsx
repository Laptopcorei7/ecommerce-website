import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersApi } from "@/api";
import type { Address } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

type FormErrors = Partial<Record<keyof Address | "paymentMethod", string>>;

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "cod", label: "Cash on Delivery", icon: "💵" },
];

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

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
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const shipping = 10.0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax + shipping;

  const validateAddress = (): boolean => {
    const errs: FormErrors = {};
    if (!address.street.trim()) errs.street = "Street address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state.trim()) errs.state = "State is required";
    if (!address.zipCode.trim()) errs.zipCode = "ZIP code is required";
    if (!address.country.trim()) errs.country = "Country is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    if (items.length === 0) {
      error("Your cart is empty");
      return;
    }
    setIsSubmitting(true);
    try {
      await ordersApi.create({
        shippingAddress: address,
      });
      await refreshCart();
      success("Order placed successfully!");
      navigate(`/orders`);
    } catch (err) {
      error((err as Error).message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">No items in cart.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-primary-600 hover:underline"
        >
          Shop now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s}
            </div>
            <span
              className={`text-sm font-medium ${step >= s ? "text-primary-600" : "text-gray-400"}`}
            >
              {s === 1 ? "Shipping" : "Payment"}
            </span>
            {s < 2 && (
              <div
                className={`w-12 h-0.5 ${step > s ? "bg-primary-600" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    placeholder="123 Main Street, Apt 4B"
                    value={address.street}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, street: e.target.value }))
                    }
                    error={errors.street}
                    required
                  />
                </div>
                <Input
                  label="City"
                  placeholder="New York"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, city: e.target.value }))
                  }
                  error={errors.city}
                  required
                />
                <Input
                  label="State / Province"
                  placeholder="NY"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, state: e.target.value }))
                  }
                  error={errors.state}
                  required
                />
                <Input
                  label="ZIP / Postal Code"
                  placeholder="10001"
                  value={address.zipCode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, zipCode: e.target.value }))
                  }
                  error={errors.zipCode}
                  required
                />
                <Input
                  label="Country"
                  placeholder="United States"
                  value={address.country}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, country: e.target.value }))
                  }
                  error={errors.country}
                  required
                />
              </div>
              <Button
                onClick={() => {
                  if (validateAddress()) setStep(2);
                }}
                size="lg"
                className="mt-5"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment Method
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Edit address
                </button>
              </div>

              {/* Shipping address recap */}
              <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm text-gray-600">
                <p className="font-medium text-gray-800">Delivering to:</p>
                <p>
                  {address.street}, {address.city}, {address.state}{" "}
                  {address.zipCode}, {address.country}
                </p>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === pm.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="sr-only"
                    />
                    <span className="text-2xl">{pm.icon}</span>
                    <span className="font-medium text-gray-900">
                      {pm.label}
                    </span>
                    {paymentMethod === pm.id && (
                      <svg
                        className="ml-auto w-5 h-5 text-primary-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </label>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                  <p className="font-medium">Demo Mode</p>
                  <p>
                    Card processing is handled by your backend. No real card
                    details needed here.
                  </p>
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                size="lg"
                fullWidth
                className="mt-5"
              >
                Place Order — ${total.toFixed(2)}
              </Button>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={
                      item.product.image ||
                      `https://placehold.co/40x40/e2e8f0/64748b?text=P`
                    }
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/40x40/e2e8f0/64748b?text=P";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    ${item.subtotal.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
