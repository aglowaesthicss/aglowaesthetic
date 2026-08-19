import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, KeyRound, Lock, User } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings | Aglow Aesthetics Portal" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Protected route check
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    setTimeout(() => {
      navigate({ to: "/login" });
    }, 100);
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please check your new password and confirmation.",
      });
      return;
    }

    if (newPassword.length < 5) {
      toast.error("Password too short", {
        description: "Your new password must be at least 5 characters long.",
      });
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success("Password updated", {
        description: "Your security credentials have been updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error("Password update failed", {
        description: err.message || "Please verify your current password.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <div className="border-b border-border/60 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100">Portal Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal details, credentials, and settings.
        </p>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* Left Side: Summary Card */}
        <div className="border border-border bg-card p-6 shadow-soft h-fit">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
              <User className="size-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg leading-tight text-zinc-100">{user.name}</h2>
              <span className="text-[0.65rem] uppercase tracking-wider text-primary font-medium block mt-1">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
          
          <div className="rule-gold my-5" />
          
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Email Address</span>
              <span className="text-zinc-200">{user.email}</span>
            </div>
            {user.client_id && (
              <div>
                <span className="text-muted-foreground block mb-0.5">Client ID</span>
                <span className="text-zinc-200">{user.client_id}</span>
              </div>
            )}
            {user.mobile_no && (
              <div>
                <span className="text-muted-foreground block mb-0.5">Mobile Number</span>
                <span className="text-zinc-200">{user.mobile_no}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Change Password Form */}
        <div className="border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <Shield className="size-5 text-primary" />
            <h2 className="font-serif text-xl text-zinc-100">Security Credentials</h2>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Update your login credentials below. All passwords must be hashed and stored securely.
          </p>

          <form onSubmit={handlePasswordChange} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3.5 size-4 text-muted-foreground/60" />
                <Input
                  id="current-password"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute top-3.5 left-3.5 size-4 text-muted-foreground/60" />
                  <Input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute top-3.5 left-3.5 size-4 text-muted-foreground/60" />
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" variant="luxe" size="lg" disabled={submitting}>
              {submitting ? "Updating Password..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
