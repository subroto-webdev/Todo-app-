"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Flag, Tag as TagIcon, ListChecks, CalendarClock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { useUIStore } from "@/store/useUIStore";
import { useTaskStore } from "@/store/useTaskStore";
import { taskService } from "@/services/taskService";
import { taskSchema, type TaskInput } from "@/validators/task";
import { PRIORITY_CONFIG } from "@/constants";
import type { Task } from "@/types";

const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
  icon: <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />,
}));

const recurrenceOptions = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function TaskFormModal() {
  const { taskModalOpen, editingTask, closeTaskModal } = useUIStore();
  const { addTask, updateTask } = useTaskStore();
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      tags: [],
      status: "pending",
      pinned: false,
      favorite: false,
      subtasks: [],
      checklist: [],
      recurrence: "none",
    },
  });

  useEffect(() => {
    if (taskModalOpen) {
      reset(
        editingTask
          ? {
              title: editingTask.title,
              description: editingTask.description ?? "",
              priority: editingTask.priority,
              tags: editingTask.tags ?? [],
              dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : "",
              status: editingTask.status,
              pinned: editingTask.pinned,
              favorite: editingTask.favorite,
              subtasks: editingTask.subtasks ?? [],
              checklist: editingTask.checklist ?? [],
              recurrence: editingTask.recurrence ?? "none",
              estimatedMinutes: editingTask.estimatedMinutes ?? undefined,
            }
          : {
              title: "",
              description: "",
              priority: "medium",
              tags: [],
              status: "pending",
              pinned: false,
              favorite: false,
              subtasks: [],
              checklist: [],
              recurrence: "none",
            }
      );
    }
  }, [taskModalOpen, editingTask, reset]);

  const tags = watch("tags") ?? [];
  const subtasks = watch("subtasks") ?? [];
  const checklist = watch("checklist") ?? [];

  const onSubmit = async (values: TaskInput) => {
    try {
      if (editingTask) {
        const updated = await taskService.update(editingTask._id, values);
        updateTask(editingTask._id, updated);
        toast.success("Task updated");
      } else {
        const created = await taskService.create(values);
        addTask(created);
        toast.success("Task created");
      }
      closeTaskModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save task");
    }
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setValue("tags", [...tags, value]);
    setTagInput("");
  };

  return (
    <Modal
      open={taskModalOpen}
      onClose={closeTaskModal}
      title={editingTask ? "Edit task" : "Create new task"}
      description={editingTask ? "Update the details below" : "Fill in the details to add a new task"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Task title"
          {...register("title")}
          error={errors.title?.message}
          autoFocus
          maxLength={200}
          showCharCount
        />

        <Textarea
          label="Description"
          {...register("description")}
          error={errors.description?.message}
          maxLength={2000}
          showCharCount
          placeholder="Add more details…"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
              <Flag className="mr-1 inline h-3.5 w-3.5" /> Priority
            </label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Dropdown options={priorityOptions} value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
              <CalendarClock className="mr-1 inline h-3.5 w-3.5" /> Due date
            </label>
            <Input type="date" {...register("dueDate")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Repeats</label>
            <Controller
              control={control}
              name="recurrence"
              render={({ field }) => (
                <Dropdown options={recurrenceOptions} value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <Input
            label="Estimated minutes"
            type="number"
            min={1}
            {...register("estimatedMinutes", { valueAsNumber: true })}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
            <TagIcon className="mr-1 inline h-3.5 w-3.5" /> Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-700 dark:text-primary-400"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setValue("tags", tags.filter((t) => t !== tag))}
                  className="text-primary-400 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add a tag and press Enter"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
            <span><ListChecks className="mr-1 inline h-3.5 w-3.5" /> Subtasks</span>
            {subtasks.length > 0 && (
              <span className="text-xs text-slate-400">
                {subtasks.filter((s) => s.completed).length}/{subtasks.length} done
              </span>
            )}
          </label>
          <div className="space-y-2">
            {subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Checkbox
                  checked={s.completed}
                  onChange={(checked) => {
                    const next = [...subtasks];
                    next[i] = { ...next[i], completed: checked };
                    setValue("subtasks", next);
                  }}
                />
                <input
                  value={s.title}
                  onChange={(e) => {
                    const next = [...subtasks];
                    next[i] = { ...next[i], title: e.target.value };
                    setValue("subtasks", next);
                  }}
                  className="h-9 flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setValue("subtasks", subtasks.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setValue("subtasks", [...subtasks, { title: "", completed: false }])}
            >
              <Plus className="h-3.5 w-3.5" /> Add subtask
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-1">
          <Controller
            control={control}
            name="pinned"
            render={({ field }) => (
              <Checkbox checked={field.value} onChange={field.onChange} label="Pin to top" />
            )}
          />
          <Controller
            control={control}
            name="favorite"
            render={({ field }) => (
              <Checkbox checked={field.value} onChange={field.onChange} label="Mark as favorite" />
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={closeTaskModal}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" loading={isSubmitting}>
            {editingTask ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
