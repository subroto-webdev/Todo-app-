"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Laptop, ShieldAlert, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { getInitials, cn } from "@/lib/utils";

async function patchProfile(payload: Record<string, unknown>) {
  const res = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message);
  return json.data;
}

export function SettingsClient() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await patchProfile({ name });
      await update({ name });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await patchProfile({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password updated");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h2 className="mb-4 font-semibold">Profile</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 text-lg font-semibold text-white">
            {session?.user?.name ? getInitials(session.user.name) : "U"}
          </div>
          <div>
            <p className="text-sm font-medium">{session?.user?.email}</p>
            <p className="text-xs text-slate-400">Your avatar is generated from your name</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={session?.user?.email ?? ""} disabled />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="gradient" loading={savingProfile} onClick={handleSaveProfile}>
            Save changes
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Change password</h2>
        <div className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="New password"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" loading={savingPassword} onClick={handleChangePassword}>
            Update password
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Laptop },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                theme === opt.value
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
              )}
            >
              <opt.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="border-rose-200 dark:border-rose-500/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-semibold text-rose-600">Danger zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deleting your account permanently removes all your tasks and data. This cannot be undone.
            </p>
            <Button variant="danger" size="sm" className="mt-3" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete account
            </Button>
          </div>
        </div>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?" size="sm">
        <p className="text-sm text-muted-foreground">
          This will permanently delete your account and all associated tasks. This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>
            Yes, delete my account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
