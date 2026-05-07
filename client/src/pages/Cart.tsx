import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";

export default function Cart() {
  const { cart, isLoading, updateItem, removeItem, itemCount, total } =
    useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingProgress = Math.min(
    (total / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );
  const amountToFreeShip = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  const handleRemove = async (id: string, name: string) => {
    await removeItem(id);
    success(`Removed "${name}"`);
  };

  if (isLoading) return <Loading message="Loading your cart…" />;

  if (!cart || cart.cart.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 rounded-3xl bg-ink-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-9 h-9 text-ink-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-ink-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-ink-400 text-sm mb-8">
            Looks like you haven't added anything yet. Start exploring our
            collections.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fdfcfa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-ink-950">
            Shopping Cart
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Free shipping bar */}
            <div className="bg-white rounded-2xl p-4 border border-ink-100">
              {amountToFreeShip > 0 ? (
                <p className="text-sm text-ink-600 mb-2">
                  Add{" "}
                  <span className="font-semibold text-ink-950">
                    ${amountToFreeShip.toFixed(2)}
                  </span>{" "}
                  more for free shipping
                </p>
              ) : (
                <p className="text-sm font-medium text-green-600 mb-2">
                  🎉 You've unlocked free shipping!
                </p>
              )}
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            {cart.cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-ink-100 flex gap-4 group"
              >
                {/* Image */}
                <Link
                  to={`/products/${item.productId}`}
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-24 rounded-xl bg-ink-100 overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-300">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm font-medium text-ink-900 hover:text-brand-700 line-clamp-2 leading-snug transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  {item.product.category && (
                    <p className="text-xs text-ink-400 mt-0.5 uppercase tracking-widest">
                      {item.product.category}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-ink-950 mt-2">
                    ${item.subtotal.toFixed(2)}
                  </p>

                  {/* Qty + Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-ink-50 rounded-full p-1">
                      <button
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-ink-500 text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-ink-900 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-ink-500 text-lg leading-none disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id, item.product.name)}
                      className="text-xs text-ink-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-ink-100 p-6 sticky top-24">
              <h2 className="font-serif text-xl font-semibold text-ink-950 mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-ink-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Shipping</span>
                  <span
                    className={
                      total >= FREE_SHIPPING_THRESHOLD
                        ? "text-green-600 font-medium"
                        : "font-medium text-ink-900"
                    }
                  >
                    {total >= FREE_SHIPPING_THRESHOLD ? "Free" : "$5.99"}
                  </span>
                </div>
                <div className="border-t border-ink-100 pt-3 flex justify-between font-semibold text-ink-950">
                  <span>Total</span>
                  <span>
                    $
                    {(total >= FREE_SHIPPING_THRESHOLD
                      ? total
                      : total + 5.99
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="btn-primary w-full justify-center mt-6"
              >
                Proceed to Checkout
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
              <Link
                to="/"
                className="btn-ghost w-full justify-center mt-2 text-xs"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
