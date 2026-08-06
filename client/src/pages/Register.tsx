import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import AuthShell from "@/components/layout/AuthShell";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/** Scores 0–4. Deliberately about length and variety, not arbitrary rules. */
function scorePassword(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH = [
  { label: "Too short", tone: "bg-ink-200" },
  { label: "Weak", tone: "bg-vermilion-600" },
  { label: "Fair", tone: "bg-clay-dark" },
  { label: "Good", tone: "bg-ink-700" },
  { label: "Strong", tone: "bg-emerald-700" },
];

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;

  const { label, tone } = STRENGTH[score];

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-px flex-1 transition-colors duration-300 ${
              i < score ? tone : "bg-ink-950/12"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 font-mono text-meta-xs uppercase text-ink-500">
        {label}
      </p>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const mismatch = confirm.length > 0 && confirm !== password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (password !== confirm) {
      setFormError("The two passwords don't match.");
      return;
    }
    if (scorePassword(password) < 2) {
      setFormError("Please choose a longer password — at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      success("Account created. Welcome to Sundry.");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        (err as Error).message || "We couldn't create the account. Try again.";
      setFormError(message);
      error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Create an account"
      intro="It takes a moment, and it's the only way to keep a bag between visits."
      photo="layering"
      footer={
        <>
          Already have one?{" "}
          <Link to="/login" className="link font-medium text-ink-950">
            Sign in
          </Link>
          .
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <p
            role="alert"
            className="mb-5 border-l-2 border-vermilion-600 bg-vermilion-600/5 px-3 py-2 text-[13px] text-vermilion-700"
          >
            {formError}
          </p>
        )}

        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            placeholder="Your name"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
            />
            <PasswordStrength password={password} />
          </div>

          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="Type it again"
            error={mismatch ? "These don't match." : undefined}
          />
        </div>

        <Button
          type="submit"
          isLoading={submitting}
          fullWidth
          size="lg"
          className="mt-6"
        >
          Create account
        </Button>

        <p className="mt-4 text-[12px] leading-relaxed text-ink-500">
          We'll only email you about orders. No newsletter unless you ask.
        </p>
      </form>
    </AuthShell>
  );
}
