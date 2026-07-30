import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, security, and preferences.</p>
      </div>
      <SettingsClient />
    </div>
  );
}
