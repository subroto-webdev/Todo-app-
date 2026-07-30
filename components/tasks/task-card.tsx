"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Star,
  Pin,
  Pencil,
  Copy,
  Archive,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  Undo2,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useTaskStore } from "@/store/useTaskStore";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types";

export function TaskCard({ task }: { task: Task }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openTaskModal } = useUIStore();
  const { updateTask, removeTask, addTask } = useTaskStore();

  const priority = PRIORITY_CONFIG[task.priority];
  const isCompleted = task.status === "completed";
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = dueDate && isPast(dueDate) && !isCompleted;
  const subtaskDone = task.subtasks.filter((s) => s.completed).length;

  const toggleComplete = async () => {
    const nextStatus = isCompleted ? "pending" : "completed";
    updateTask(task._id, { status: nextStatus });
    try {
      await taskService.update(task._id, { status: nextStatus });
      if (!isCompleted) toast.success("Task completed 🎉");
    } catch {
      updateTask(task._id, { status: task.status });
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    const snapshot = task;
    removeTask(task._id);
    try {
      await taskService.remove(task._id);
      toast.success("Task deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            const { _id, createdAt, updatedAt, ...rest } = snapshot;
            const restored = await taskService.create(rest as any);
            addTask(restored);
          },
        },
      });
    } catch {
      addTask(snapshot);
      toast.error("Failed to delete task");
    }
  };

  const handleArchive = async () => {
    const archived = !task.archived;
    updateTask(task._id, { archived });
    try {
      await taskService.update(task._id, { archived });
      toast.success(archived ? "Task archived" : "Task restored");
    } catch {
      updateTask(task._id, { archived: task.archived });
      toast.error("Failed to update task");
    }
  };

  const handleDuplicate = async () => {
    try {
      const copy = await taskService.duplicate(task._id);
      addTask(copy);
      toast.success("Task duplicated");
    } catch {
      toast.error("Failed to duplicate task");
    }
  };

  const toggleField = async (field: "favorite" | "pinned") => {
    const value = !task[field];
    updateTask(task._id, { [field]: value } as Partial<Task>);
    try {
      await taskService.update(task._id, { [field]: value } as Partial<Task>);
    } catch {
      updateTask(task._id, { [field]: task[field] } as Partial<Task>);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group glass-card relative p-4 transition-all hover:shadow-lg",
        task.pinned && "ring-1 ring-primary-500/30"
      )}
    >
      {task.colorLabel && (
        <span
          className="absolute left-0 top-4 h-8 w-1 rounded-r-full"
          style={{ backgroundColor: task.colorLabel }}
        />
      )}

      <div className="flex items-start gap-3">
        <button onClick={toggleComplete} className="mt-0.5 shrink-0 text-primary-600 btn-focus rounded-full">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 fill-primary-600 text-white" />
          ) : (
            <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 hover:text-primary-500" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "text-sm font-semibold text-slate-800 dark:text-slate-100 truncate",
                isCompleted && "text-slate-400 line-through"
              )}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {task.pinned && <Pin className="h-3.5 w-3.5 text-primary-500 fill-primary-500" />}
              <button
                onClick={() => toggleField("favorite")}
                className="text-slate-300 hover:text-amber-400 transition-colors"
                aria-label="Toggle favorite"
              >
                <Star className={cn("h-4 w-4", task.favorite && "fill-amber-400 text-amber-400")} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="glass-card absolute right-0 z-20 mt-1 w-44 p-1.5 animate-scale-in origin-top-right">
                      <MenuItem icon={Pencil} label="Edit" onClick={() => { openTaskModal(task); setMenuOpen(false); }} />
                      <MenuItem icon={Copy} label="Duplicate" onClick={() => { handleDuplicate(); setMenuOpen(false); }} />
                      <MenuItem icon={Pin} label={task.pinned ? "Unpin" : "Pin"} onClick={() => { toggleField("pinned"); setMenuOpen(false); }} />
                      <MenuItem
                        icon={task.archived ? Undo2 : Archive}
                        label={task.archived ? "Restore" : "Archive"}
                        onClick={() => { handleArchive(); setMenuOpen(false); }}
                      />
                      <MenuItem icon={Trash2} label="Delete" danger onClick={() => { handleDelete(); setMenuOpen(false); }} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}

          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${(subtaskDone / task.subtasks.length) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {subtaskDone}/{task.subtasks.length} subtasks
              </p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge className={cn(priority.bg, priority.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} /> {priority.label}
            </Badge>
            <Badge className={cn(STATUS_CONFIG[task.status].bg, STATUS_CONFIG[task.status].color)}>
              {STATUS_CONFIG[task.status].label}
            </Badge>
            {dueDate && (
              <Badge variant={overdue ? "danger" : isToday(dueDate) ? "warning" : "outline"}>
                <Calendar className="h-3 w-3" />
                {format(dueDate, "MMM d")}
              </Badge>
            )}
            {task.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        danger
          ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
