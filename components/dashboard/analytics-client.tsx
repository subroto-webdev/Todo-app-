"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrendingUp, Target, AlertCircle, ListChecks } from "lucide-react";
import { Card, Skeleton } from "@/components/ui/card";
import {
  CompletionTrendChart,
  PriorityDistributionChart,
  CategoryDistributionChart,
} from "@/components/dashboard/analytics-charts";
import { analyticsService } from "@/services/taskService";

export function AnalyticsClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .get()
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
    );
  }

  if (!data) return null;

  const { overview, completionTrend, priorityDistribution, categoryDistribution } = data;

  const summary = [
    { label: "Completion rate", value: `${overview.completionRate}%`, icon: Target, accent: "text-emerald-600" },
    { label: "Total tasks", value: overview.total, icon: ListChecks, accent: "text-blue-600" },
    { label: "Completed", value: overview.completed, icon: TrendingUp, accent: "text-primary-600" },
    { label: "Overdue", value: overview.overdue, icon: AlertCircle, accent: "text-rose-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className={`h-4 w-4 ${s.accent}`} />
            <p className="mt-2 text-xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-1 font-semibold">Completion trend</h2>
        <p className="mb-2 text-xs text-slate-400">Tasks completed over the last 30 days</p>
        <CompletionTrendChart data={completionTrend} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Priority distribution</h2>
          {priorityDistribution.length > 0 ? (
            <PriorityDistributionChart data={priorityDistribution} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No data yet</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Category breakdown</h2>
          {categoryDistribution.length > 0 ? (
            <CategoryDistributionChart data={categoryDistribution} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No categories yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
