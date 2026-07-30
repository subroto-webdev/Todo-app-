import { z } from "zod";

export const subtaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1, "Subtask title is required").max(200),
  completed: z.boolean().default(false),
});

export const checklistItemSchema = z.object({
  _id: z.string().optional(),
  label: z.string().trim().min(1, "Checklist item is required").max(200),
  checked: z.boolean().default(false),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional().default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.string().nullish(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  dueDate: z.string().nullish(),
  reminderAt: z.string().nullish(),
  estimatedMinutes: z.number().int().positive().nullish(),
  status: z.enum(["pending", "in-progress", "completed", "archived"]).default("pending"),
  pinned: z.boolean().default(false),
  favorite: z.boolean().default(false),
  colorLabel: z.string().optional().default(""),
  subtasks: z.array(subtaskSchema).default([]),
  checklist: z.array(checklistItemSchema).default([]),
  recurrence: z
    .enum(["none", "daily", "weekly", "monthly", "yearly", "custom"])
    .default("none"),
  recurrenceInterval: z.number().int().positive().nullish(),
});

export const taskUpdateSchema = taskSchema.partial();

export const bulkActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one task"),
  action: z.enum([
    "complete",
    "archive",
    "restore",
    "delete",
    "favorite",
    "unfavorite",
    "pin",
    "unpin",
    "move",
  ]),
  category: z.string().nullish(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
