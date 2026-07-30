"use client";

import { motion } from "framer-motion";
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: string;
  suffix?: string;
}

export function OverviewCards({
  total,
  completed,
  pending,
  overdue,
}: {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}) {
  const cards: StatCard[] = [
    { label: "Total tasks", value: total, icon: ListTodo, accent: "from-blue-500 to-blue-600" },
    { label: "Completed", value: completed, icon: CheckCircle2, accent: "from-emerald-500 to-emerald-600" },
    { label: "In progress", value: pending, icon: Clock, accent: "from-amber-500 to-amber-600" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, accent: "from-rose-500 to-rose-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
          className="glass-card p-4 lg:p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br text-white", card.accent)}>
              <card.icon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {card.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
