"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { EnterpriseLoader } from "@/src/components/common/EnterpriseLoader";
import { useAuth } from "@/src/hooks/useAuth";
import { authService } from "@/src/lib/auth/auth-service";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";

const MIN_LENGTH = 8;

/** Forced after signing in with a temporary password (invite / admin reset);
 * also reachable any time to change your own password. */
export function ChangePasswordForm() {
  const router = useRouter();
  const { status, user, replaceSession, logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace(AUTH_ROUTES.login);
  }, [status, router]);

  if (!user) return <EnterpriseLoader label="Verifying session" sublabel="One moment" />;

  const forced = Boolean(user.mustChangePassword);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < MIN_LENGTH) return setError(`Use at least ${MIN_LENGTH} characters.`);
    if (next !== confirm) return setError("The new passwords don't match.");
    if (next === current) return setError("Choose a password different from the current one.");
    setSaving(true);
    try {
      const session = await authService.changePassword(current, next);
      if (session) {
        replaceSession(session);
        toast.success("Password updated");
        router.replace(authService.getLoginRedirect(session));
      }
    } catch (err) {
      setError((err as NormalizedApiError).msg || "Couldn't update your password.");
    } finally {
      setSaving(false);
    }
  };

  const field = (id: string, label: string, value: string, set: (v: string) => void, autoComplete: string) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => set(e.target.value)}
        required
        className="h-10"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7F6] px-4 py-10 dark:bg-background">
      <div className="w-full max-w-md rounded-xl border border-[#E3E9E5] bg-card p-6 shadow-sm dark:border-border sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F7A4A]/10 text-[#1F7A4A] dark:bg-primary/15 dark:text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
            <p className="text-sm text-muted-foreground">
              {forced
                ? `Hi ${user.displayName.split(" ")[0]} — replace your temporary password to continue.`
                : "Choose a new password for your account."}
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {field("current-password", forced ? "Temporary password" : "Current password", current, setCurrent, "current-password")}
          {field("new-password", "New password", next, setNext, "new-password")}
          {field("confirm-password", "Confirm new password", confirm, setConfirm, "new-password")}
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {show ? "Hide passwords" : "Show passwords"}
          </button>
          <p className="text-xs text-muted-foreground">At least {MIN_LENGTH} characters. Signing in elsewhere will be signed out.</p>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}
          <Button type="submit" className="h-10 w-full bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save new password
          </Button>
          <div className="flex justify-between text-xs">
            {!forced ? (
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
                Cancel
              </button>
            ) : (
              <span />
            )}
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => logout()}>
              Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
