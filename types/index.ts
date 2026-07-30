export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in-progress" | "completed" | "archived";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface ChecklistItem {
  _id: string;
  label: string;
  checked: boolean;
}

export interface Attachment {
  _id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category?: Category | string | null;
  tags: string[];
  dueDate?: string | null;
  reminderAt?: string | null;
  estimatedMinutes?: number | null;
  status: TaskStatus;
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  colorLabel?: string;
  attachments: Attachment[];
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  recurrence: RecurrenceType;
  recurrenceInterval?: number | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  emailVerified: boolean;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  category?: string | "all";
  tag?: string;
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
  sortBy?: "newest" | "oldest" | "priority" | "alphabetical" | "dueDate";
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  dueToday: number;
}
