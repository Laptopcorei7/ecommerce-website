import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import AuthShell from "@/components/layout/AuthShell";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Set by ProductCard and ProductDetail when a guest tries to save or add to
  // bag — sign in should return them to what they were looking at.
  const returnTo = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      success("Welcome back.");
      navigate(returnTo, { replace: true });
    } catch (err) {
      const message =
        (err as Error).message || "We couldn't sign you in. Try again.";
      setFormError(message);
      error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Sign in"
      intro="Your bag, saved items and order history are kept against your account."
      photo="workshop"
      caption="Everything you left in your bag is still there."
      footer={
        <>
          No account yet?{" "}
          <Link to="/register" className="link font-medium text-ink-950">
            Create one
          </Link>
          .
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <p
            role="alert"
            className="mb-5 border-l-2 border-vermilion-600 bg-vermilion-600/5 px-3 py-2 text-[15px] text-vermilion-700"
          >
            {formError}
          </p>
        )}

        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="font-mono text-meta-xs uppercase text-ink-600 transition-colors hover:text-ink-950"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
        </div>

        <Button
          type="submit"
          isLoading={submitting}
          fullWidth
          size="lg"
          className="mt-6"
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
