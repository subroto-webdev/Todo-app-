"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { PRIORITY_CONFIG } from "@/constants";

const priorityColors: Record<string, string> = {
  low: "#3b82f6",
  medium: "#d97706",
  high: "#f97316",
  urgent: "#e11d48",
};

export function CompletionTrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => format(parseISO(d), "MMM d")}
          tick={{ fontSize: 11 }}
          interval={4}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          labelFormatter={(d) => format(parseISO(d as string), "MMM d, yyyy")}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PriorityDistributionChart({ data }: { data: { priority: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="priority" innerRadius={55} outerRadius={80} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.priority} fill={priorityColors[entry.priority] ?? "#64748b"} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [value, PRIORITY_CONFIG[name as keyof typeof PRIORITY_CONFIG]?.label ?? name]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CategoryDistributionChart({ data }: { data: { name: string; count: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
