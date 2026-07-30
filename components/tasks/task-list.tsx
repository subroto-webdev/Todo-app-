"use client";

import { AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ListTodo, CheckSquare, Square, Trash2, Archive, CheckCircle2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/tasks/task-card";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { Skeleton, EmptyState } from "@/components/ui/card";
import { PRIORITY_CONFIG, SORT_OPTIONS } from "@/constants";
import { taskService } from "@/services/taskService";
import { toast } from "sonner";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "all", label: "All priorities" },
  ...Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label })),
];

export function TaskListView() {
  const { filters, setFilters, selectedIds, toggleSelect, clearSelection, selectAll, tasks: storeTasks, setTasks } =
    useTaskStore();
  const { tasks, isLoading, refetch } = useTasks();

  const allSelected = tasks.length > 0 && selectedIds.length === tasks.length;

  const handleBulk = async (action: string) => {
    try {
      await taskService.bulk(selectedIds, action);
      toast.success("Tasks updated");
      clearSelection();
      refetch();
    } catch {
      toast.error("Bulk action failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="glass-card flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search tasks…"
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 pl-10 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
          />
        </div>
        <Dropdown
          className="w-40"
          options={statusOptions}
          value={filters.status ?? "all"}
          onChange={(v) => setFilters({ status: v as any })}
        />
        <Dropdown
          className="w-40"
          options={priorityOptions}
          value={filters.priority ?? "all"}
          onChange={(v) => setFilters({ priority: v as any })}
        />
        <Dropdown
          className="w-44"
          options={SORT_OPTIONS as unknown as { value: string; label: string }[]}
          value={filters.sortBy ?? "newest"}
          onChange={(v) => setFilters({ sortBy: v as any })}
        />
        <Button
          variant={filters.archived ? "default" : "outline"}
          size="sm"
          onClick={() => setFilters({ archived: !filters.archived })}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {filters.archived ? "Showing archived" : "Show archived"}
        </Button>
      </div>

      {/* Bulk toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <div className="glass-card flex items-center gap-3 p-3 animate-slide-up">
            <button
              onClick={() => (allSelected ? clearSelection() : selectAll(tasks.map((t) => t._id)))}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {selectedIds.length} selected
            </button>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulk("complete")}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulk("archive")}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleBulk("delete")}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Task grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-6 w-6" />}
          title="No tasks found"
          description="Try adjusting your filters, or create a new task to get started."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <div key={task._id} className="relative">
                <button
                  onClick={() => toggleSelect(task._id)}
                  className={`absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 transition-opacity ${
                    selectedIds.includes(task._id)
                      ? "border-primary-600 opacity-100"
                      : "border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100 hover:opacity-100"
                  }`}
                >
                  {selectedIds.includes(task._id) && <CheckCircle2 className="h-4 w-4 text-primary-600" />}
                </button>
                <TaskCard task={task} />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
