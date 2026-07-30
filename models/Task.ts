import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in-progress" | "completed" | "archived";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface ISubtask {
  _id?: Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface IChecklistItem {
  _id?: Types.ObjectId;
  label: string;
  checked: boolean;
}

export interface IAttachment {
  _id?: Types.ObjectId;
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  priority: TaskPriority;
  category?: Types.ObjectId;
  tags: string[];
  dueDate?: Date;
  reminderAt?: Date;
  estimatedMinutes?: number;
  status: TaskStatus;
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  colorLabel?: string;
  attachments: IAttachment[];
  subtasks: ISubtask[];
  checklist: IChecklistItem[];
  recurrence: RecurrenceType;
  recurrenceInterval?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const ChecklistSchema = new Schema<IChecklistItem>(
  {
    label: { type: String, required: true, trim: true, maxlength: 200 },
    checked: { type: Boolean, default: false },
  },
  { _id: true }
);

const AttachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    tags: { type: [String], default: [] },
    dueDate: { type: Date, default: null, index: true },
    reminderAt: { type: Date, default: null },
    estimatedMinutes: { type: Number, default: null },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "archived"],
      default: "pending",
      index: true,
    },
    pinned: { type: Boolean, default: false, index: true },
    favorite: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
    colorLabel: { type: String, default: "" },
    attachments: { type: [AttachmentSchema], default: [] },
    subtasks: { type: [SubtaskSchema], default: [] },
    checklist: { type: [ChecklistSchema], default: [] },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly", "yearly", "custom"],
      default: "none",
    },
    recurrenceInterval: { type: Number, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns (dashboard, filters, search)
TaskSchema.index({ userId: 1, status: 1, archived: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ title: "text", description: "text", tags: "text" });

export const Task: Model<ITask> = models.Task || model<ITask>("Task", TaskSchema);
export default Task;
