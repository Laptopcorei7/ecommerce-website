import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid email or password";
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-950 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-600 blur-3xl" />
        </div>
        <div className="relative text-center px-16">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-serif text-3xl font-bold">L</span>
          </div>
          <h2 className="font-serif text-4xl text-white font-semibold mb-4 leading-tight">
            Welcome
            <br />
            Back
          </h2>
          <p className="text-ink-400 leading-relaxed">
            Sign in to access your orders, wishlist, and personalized
            recommendations.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              ["10K+", "Products"],
              ["50K+", "Customers"],
              ["4.9★", "Rating"],
            ].map(([num, lbl]) => (
              <div key={lbl}>
                <p className="font-serif text-2xl text-white font-semibold">
                  {num}
                </p>
                <p className="text-xs text-ink-400 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-ink-950 flex items-center justify-center">
              <span className="text-white font-serif text-sm font-bold">L</span>
            </div>
            <span className="font-serif text-xl font-semibold text-ink-950">
              Luxe
            </span>
          </Link>

          <h1 className="font-serif text-3xl font-semibold text-ink-950 mb-1">
            Sign in
          </h1>
          <p className="text-ink-400 text-sm mb-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="you@example.com"
                className={`input-field ${errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-ink-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className={`input-field pr-11 ${errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-4.5 h-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4.5 h-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 justify-center"
            >
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : null}
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
