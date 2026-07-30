import { AnalyticsClient } from "@/components/dashboard/analytics-client";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your productivity trends over time.</p>
      </div>
      <AnalyticsClient />
    </div>
  );
}
