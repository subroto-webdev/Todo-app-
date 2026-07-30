"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, List } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useUIStore } from "@/store/useUIStore";
import { PRIORITY_CONFIG } from "@/constants";
import { Button } from "@/components/ui/button";
import { Skeleton, EmptyState } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "agenda">("month");
  const { tasks, isLoading } = useTasks();
  const { openTaskModal } = useUIStore();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks
      .filter((t) => t.dueDate)
      .forEach((t) => {
        const key = format(new Date(t.dueDate as string), "yyyy-MM-dd");
        map.set(key, [...(map.get(key) ?? []), t]);
      });
    return map;
  }, [tasks]);

  const agendaTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()),
    [tasks]
  );

  if (isLoading) return <Skeleton className="h-[600px]" />;

  return (
    <div className="glass-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[140px] text-center text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setView("month")}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", view === "month" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Month
          </button>
          <button
            onClick={() => setView("agenda")}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", view === "agenda" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
          >
            <List className="h-3.5 w-3.5" /> Agenda
          </button>
        </div>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-1.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-slate-400">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={cn(
                  "min-h-[92px] rounded-xl border border-transparent p-1.5 transition-colors",
                  isSameMonth(day, currentMonth) ? "bg-slate-50/60 dark:bg-slate-900/40" : "opacity-40",
                  isToday(day) && "border-primary-400 bg-primary-50/50 dark:bg-primary-500/5"
                )}
              >
                <p className={cn("mb-1 text-xs font-medium", isToday(day) ? "text-primary-600" : "text-slate-500")}>
                  {format(day, "d")}
                </p>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map((t) => (
                    <button
                      key={t._id}
                      onClick={() => openTaskModal(t)}
                      className={cn(
                        "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium",
                        PRIORITY_CONFIG[t.priority].bg,
                        PRIORITY_CONFIG[t.priority].color
                      )}
                    >
                      {t.title}
                    </button>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="px-1.5 text-[10px] text-slate-400">+{dayTasks.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : agendaTasks.length === 0 ? (
        <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No scheduled tasks" description="Tasks with a due date will show up here." />
      ) : (
        <div className="space-y-1.5">
          {agendaTasks.map((t) => (
            <button
              key={t._id}
              onClick={() => openTaskModal(t)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                <span className="text-[10px] font-medium text-slate-400">{format(new Date(t.dueDate!), "MMM")}</span>
                <span className="text-sm font-bold leading-none">{format(new Date(t.dueDate!), "d")}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-slate-400">{format(new Date(t.dueDate!), "EEEE, h:mm a")}</p>
              </div>
              <span className={cn("h-2 w-2 rounded-full shrink-0", PRIORITY_CONFIG[t.priority].dot)} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
