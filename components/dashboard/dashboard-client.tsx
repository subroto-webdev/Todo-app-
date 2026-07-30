"use client";

import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import { Plus, ArrowRight, Clock, Flag } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_CONFIG } from "@/constants";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

function friendlyDate(date: string) {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
}

export function DashboardClient({ recent, upcoming }: { recent: Task[]; upcoming: Task[] }) {
  const { openTaskModal } = useUIStore();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Recent activity</h2>
          <Link href="/tasks" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={<Plus className="h-5 w-5" />}
            title="No tasks yet"
            description="Create your first task to see activity here."
            action={
              <Button size="sm" variant="gradient" onClick={() => openTaskModal()}>
                <Plus className="h-3.5 w-3.5" /> New task
              </Button>
            }
          />
        ) : (
          <div className="space-y-1">
            {recent.map((task) => (
              <button
                key={task._id}
                onClick={() => openTaskModal(task)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className={cn("truncate text-sm font-medium", task.status === "completed" && "line-through text-slate-400")}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400">Updated {format(new Date(task.updatedAt), "MMM d, h:mm a")}</p>
                </div>
                <Badge className={cn(PRIORITY_CONFIG[task.priority].bg, PRIORITY_CONFIG[task.priority].color)}>
                  {PRIORITY_CONFIG[task.priority].label}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Upcoming deadlines</h2>
          <Link href="/calendar" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
            Calendar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState icon={<Clock className="h-5 w-5" />} title="Nothing due soon" description="You're all caught up." />
        ) : (
          <div className="space-y-1">
            {upcoming.map((task) => (
              <button
                key={task._id}
                onClick={() => openTaskModal(task)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Flag className={cn("h-3.5 w-3.5 shrink-0", PRIORITY_CONFIG[task.priority].color)} />
                  <p className="truncate text-sm font-medium">{task.title}</p>
                </div>
                <Badge variant="outline">{task.dueDate ? friendlyDate(task.dueDate) : "—"}</Badge>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
