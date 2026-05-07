import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, isAdmin, isAdminSession } = useAuth();
  const [form, setForm] = useState({
    employeeId: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Already has a live admin session in this tab — go straight to dashboard
  if (isAdmin && isAdminSession) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await adminLogin(form.employeeId, form.email, form.password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
            Luxe Admin Portal
          </span>
        </div>
        <a
          href="/"
          className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200 flex items-center gap-1.5"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to store
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-white/50 text-[11px] font-medium tracking-widest uppercase">
                Restricted Access
              </span>
            </div>
            <h1 className="font-serif text-3xl font-semibold text-white mb-2">
              Admin Sign In
            </h1>
            <p className="text-white/35 text-sm leading-relaxed">
              This portal is for authorised personnel only. Unauthorised access
              attempts are logged.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee ID */}
            <div>
              <label className="block text-white/50 text-xs font-medium uppercase tracking-widest mb-2">
                Employee ID
              </label>
              <input
                name="employeeId"
                type="text"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="e.g. ADMIN001"
                autoComplete="off"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/50 text-xs font-medium uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@luxe.com"
                autoComplete="email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/50 text-xs font-medium uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-200"
                >
                  {showPassword ? (
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
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
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
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <svg
                  className="w-4 h-4 text-red-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
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
                  Verifying…
                </>
              ) : (
                <>
                  Sign In
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
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-white/20 text-[11px] text-center mt-8 leading-relaxed">
            Having trouble signing in? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
