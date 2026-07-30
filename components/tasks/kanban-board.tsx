"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from "@/constants";
import { useTaskStore } from "@/store/useTaskStore";
import { useTasks } from "@/hooks/useTasks";
import { taskService } from "@/services/taskService";
import { Skeleton } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

function KanbanCard({ task }: { task: Task }) {
  const { openTaskModal } = useUIStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => openTaskModal(task)}
      className={cn(
        "glass-card cursor-grab active:cursor-grabbing p-3.5 mb-2.5 hover:shadow-md transition-shadow",
        isDragging && "opacity-40"
      )}
    >
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{task.title}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <Badge className={cn(priority.bg, priority.color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} /> {priority.label}
        </Badge>
        {task.subtasks.length > 0 && (
          <span className="text-[11px] text-slate-400">
            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
          </span>
        )}
      </div>
    </div>
  );
}

function Column({ id, title, tasks }: { id: TaskStatus; title: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <span className="rounded-full bg-white dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[120px] flex-1 rounded-xl transition-colors overflow-y-auto scrollbar-thin p-0.5",
          isOver && "bg-primary-50/50 dark:bg-primary-500/5 ring-2 ring-primary-300 dark:ring-primary-700"
        )}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, isLoading } = useTasks();
  const { updateTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columns = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { pending: [], "in-progress": [], completed: [], archived: [] };
    tasks.forEach((t) => map[t.status]?.push(t));
    return map;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    // over.id is either a column id or another task's id (dropped within a column)
    const overColumn = KANBAN_COLUMNS.find((c) => c.id === over.id)?.id;
    const targetStatus = overColumn ?? tasks.find((t) => t._id === over.id)?.status;

    if (!targetStatus || targetStatus === task.status) return;

    updateTask(taskId, { status: targetStatus });
    try {
      await taskService.update(taskId, { status: targetStatus });
    } catch {
      updateTask(taskId, { status: task.status });
      toast.error("Failed to move task");
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((c) => (
          <Skeleton key={c.id} className="h-96 w-72 shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {KANBAN_COLUMNS.map((col) => (
          <Column key={col.id} id={col.id} title={col.title} tasks={columns[col.id]} />
        ))}
      </div>
      <DragOverlay>{activeTask && <KanbanCard task={activeTask} />}</DragOverlay>
    </DndContext>
  );
}
