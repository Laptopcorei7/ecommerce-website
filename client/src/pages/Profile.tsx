import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/api";
import { useToast } from "@/contexts/ToastContext";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

type Tab = "profile" | "password";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { success, error } = useToast();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile form
  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Name is required");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await profileApi.update({ name });
      setUser((u) => (u ? { ...u, ...updated.user } : u));
      success("Profile updated successfully!");
    } catch (err) {
      error((err as Error).message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = "Current password is required";
    if (!newPassword) errs.newPassword = "New password is required";
    else if (newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters";
    if (newPassword !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});
    setSavingPassword(true);
    try {
      await profileApi.changePassword({ currentPassword, newPassword });
      success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      error((err as Error).message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Account Settings
      </h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.role === "admin" && (
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 mb-6">
        {(
          [
            ["profile", "Profile"],
            ["password", "Password"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />
          <Input
            label="Email Address"
            value={user?.email ?? ""}
            disabled
            hint="Email address cannot be changed"
          />
          <div className="pt-2">
            <Button type="submit" isLoading={savingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {tab === "password" && (
        <form
          onSubmit={handleChangePassword}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={passwordErrors.currentPassword}
            required
            placeholder="Your current password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={passwordErrors.newPassword}
            required
            placeholder="At least 8 characters"
            hint={
              !passwordErrors.newPassword ? "Minimum 8 characters" : undefined
            }
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordErrors.confirmPassword}
            required
            placeholder="Re-enter new password"
          />

          {/* Password strength */}
          {newPassword && (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">Password strength</p>
              <div className="flex gap-1">
                {[
                  newPassword.length >= 8,
                  /[A-Z]/.test(newPassword),
                  /[a-z]/.test(newPassword),
                  /[0-9]/.test(newPassword),
                ].map((passed, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      passed ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[
                  { label: "8+ characters", ok: newPassword.length >= 8 },
                  { label: "Uppercase", ok: /[A-Z]/.test(newPassword) },
                  { label: "Lowercase", ok: /[a-z]/.test(newPassword) },
                  { label: "Number", ok: /[0-9]/.test(newPassword) },
                ].map(({ label, ok }) => (
                  <span
                    key={label}
                    className={`text-[10px] flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}
                  >
                    {ok ? "✓" : "○"} {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" isLoading={savingPassword}>
              Change Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
