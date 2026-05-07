import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-brand-400", "bg-green-500"];
  return password ? (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : "bg-ink-200"}`}
          />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map(({ label, ok }) => (
          <span
            key={label}
            className={`text-[10px] flex items-center gap-1 ${ok ? "text-green-600" : "text-ink-400"}`}
          >
            {ok ? "✓" : "○"} {label}
          </span>
        ))}
      </div>
    </div>
  ) : null;
}

export default function Register() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "At least 8 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.password !== form.confirm)
      e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      success(
        "Registration successful! Please check your email to verify your account.",
      );
      navigate("/login", { replace: true }); // ← send them to login, not home
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-brand-600 blur-3xl" />
        </div>
        <div className="relative text-center px-16">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-serif text-3xl font-bold">L</span>
          </div>
          <h2 className="font-serif text-4xl text-white font-semibold mb-4 leading-tight">
            Join the
            <br />
            Community
          </h2>
          <p className="text-ink-400 leading-relaxed">
            Create your account and unlock access to exclusive deals, early
            arrivals, and a curated shopping experience.
          </p>
          <div className="mt-10 space-y-3">
            {[
              "Free shipping on first order",
              "Early access to new arrivals",
              "Exclusive member discounts",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-left">
                <div className="w-5 h-5 rounded-full bg-brand-600/30 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-brand-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
                <span className="text-sm text-ink-300">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-ink-950 flex items-center justify-center">
              <span className="text-white font-serif text-sm font-bold">L</span>
            </div>
            <span className="font-serif text-xl font-semibold text-ink-950">
              Luxe
            </span>
          </Link>

          <h1 className="font-serif text-3xl font-semibold text-ink-950 mb-1">
            Create account
          </h1>
          <p className="text-ink-400 text-sm mb-8">
            Already have one?{" "}
            <Link
              to="/login"
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                key: "name",
                label: "Full Name",
                type: "text",
                placeholder: "Jane Doe",
              },
              {
                key: "email",
                label: "Email",
                type: "email",
                placeholder: "you@example.com",
              },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className={`input-field ${errors[key as keyof typeof errors] ? "border-red-400" : ""}`}
                />
                {errors[key as keyof typeof errors] && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors[key as keyof typeof errors]}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Min. 8 characters"
                  className={`input-field pr-11 ${errors.password ? "border-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
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
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={form.confirm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirm: e.target.value }))
                }
                placeholder="••••••••"
                className={`input-field ${errors.confirm ? "border-red-400" : ""}`}
              />
              {errors.confirm && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirm}</p>
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
              {isLoading ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-xs text-center text-ink-400">
              By creating an account you agree to our{" "}
              <a href="#" className="underline hover:text-ink-700">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-ink-700">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
