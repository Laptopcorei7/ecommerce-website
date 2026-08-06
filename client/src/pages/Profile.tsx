import { useState } from "react";
import { profileApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { formatDate } from "@/lib/format";

type Tab = "profile" | "security";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Details" },
  { id: "security", label: "Password" },
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const { success, error } = useToast();

  const [tab, setTab] = useState<Tab>("profile");

  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [savingPassword, setSavingPassword] = useState(false);

  const nameChanged = name.trim() !== (user?.name ?? "") && name.trim() !== "";

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!nameChanged) return;

    setSavingProfile(true);
    try {
      const res = await profileApi.update({ name: name.trim() });
      setUser(res.user);
      success("Your details have been updated.");
    } catch (err) {
      error((err as Error).message || "Could not save your details.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = "Enter your current password.";
    if (newPassword.length < 8) errs.newPassword = "Use at least 8 characters.";
    if (newPassword !== confirmPassword)
      errs.confirmPassword = "These don't match.";
    if (newPassword && newPassword === currentPassword)
      errs.newPassword = "That's the password you already have.";

    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingPassword(true);
    try {
      await profileApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      success("Password changed. Other sessions have been signed out.");
    } catch (err) {
      error((err as Error).message || "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="shell py-12">
      <header className="border-b border-ink-950/12 pb-6">
        <p className="meta">Account</p>
        <h1 className="display-sm mt-3 text-ink-950">{user?.name}</h1>
      </header>

      <div className="grid gap-12 py-10 lg:grid-cols-12 lg:gap-14">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="lg:col-span-3">
          <nav className="flex gap-6 lg:flex-col lg:gap-0">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={`relative py-2 text-left font-mono text-meta uppercase transition-colors lg:border-b lg:border-ink-950/12 lg:py-3 ${
                  tab === id
                    ? "text-ink-950"
                    : "text-ink-600 hover:text-ink-950"
                }`}
              >
                {label}
                <span
                  aria-hidden
                  className={`absolute bottom-0 left-0 h-px w-full bg-vermilion-600 transition-transform duration-300 ease-out ${
                    tab === id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </nav>

          <dl className="mt-10 space-y-4">
            <div>
              <dt className="meta">Email</dt>
              <dd className="mt-1 truncate text-[15px] text-ink-800">
                {user?.email}
              </dd>
            </div>
            <div>
              <dt className="meta">Member since</dt>
              <dd className="mt-1 font-mono text-[15px] tabular text-ink-800">
                {formatDate(user?.createdAt)}
              </dd>
            </div>
            {user?.role === "admin" && (
              <div>
                <dt className="meta">Role</dt>
                <dd className="mt-1 font-mono text-[15px] uppercase text-vermilion-600">
                  Administrator
                </dd>
              </div>
            )}
          </dl>
        </aside>

        {/* ── Panel ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-6 lg:col-start-5">
          {tab === "profile" ? (
            <form onSubmit={handleSaveProfile} className="max-w-md">
              <p className="meta-strong">Your details</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
                Your name appears on orders and on any reviews you write.
              </p>

              <div className="mt-6 space-y-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />

                <Input
                  label="Email"
                  value={user?.email ?? ""}
                  disabled
                  hint="Email changes aren't available in this build — there's no mail transport wired up to verify a new address."
                />
              </div>

              <Button
                type="submit"
                isLoading={savingProfile}
                disabled={!nameChanged}
                className="mt-6"
              >
                Save changes
              </Button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="max-w-md">
              <p className="meta-strong">Change password</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
                Changing your password signs out every other session, on every
                device.
              </p>

              <div className="mt-6 space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  error={passwordErrors.currentPassword}
                />
                <Input
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  error={passwordErrors.newPassword}
                  hint={
                    passwordErrors.newPassword
                      ? undefined
                      : "At least 8 characters."
                  }
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  error={passwordErrors.confirmPassword}
                />
              </div>

              <Button type="submit" isLoading={savingPassword} className="mt-6">
                Change password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
