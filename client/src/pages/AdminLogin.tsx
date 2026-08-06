import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import AuthShell from "@/components/layout/AuthShell";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await adminLogin(employeeId.trim(), email.trim(), password);
      success("Signed in to administration.");
      navigate("/admin", { replace: true });
    } catch (err) {
      const message =
        (err as Error).message || "Those credentials weren't accepted.";
      setFormError(message);
      error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Administration"
      title="Staff sign in"
      intro="Administration requires an employee ID in addition to the usual credentials, and the elevated session lasts only as long as this tab."
      photo="table"
      caption="The back of the shop."
      footer={
        <>
          Not staff?{" "}
          <Link to="/login" className="link font-medium text-ink-950">
            Customer sign in
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
            label="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            autoComplete="off"
            required
            placeholder="e.g. SUN-0142"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
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
