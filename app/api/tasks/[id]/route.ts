import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { taskUpdateSchema } from "@/validators/task";
import { apiError, apiSuccess } from "@/lib/utils";
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

async function getOwnedTask(id: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Task.findOne({ _id: id, userId });
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const task = await getOwnedTask(params.id, (session.user as { id: string }).id);
    if (!task) return apiError("Task not found", 404);

    return apiSuccess(task, "Task fetched");
  } catch (err) {
    console.error("[TASK_GET_ERROR]", err);
    return apiError("Failed to fetch task", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const task = await getOwnedTask(params.id, (session.user as { id: string }).id);
    if (!task) return apiError("Task not found", 404);

    Object.assign(task, parsed.data);

    // Track completion timestamp for analytics/streaks
    if (parsed.data.status === "completed" && !task.completedAt) {
      task.completedAt = new Date();
    } else if (parsed.data.status && parsed.data.status !== "completed") {
      task.completedAt = undefined;
    }

    await task.save();
    return apiSuccess(task, "Task updated");
  } catch (err) {
    console.error("[TASK_PATCH_ERROR]", err);
    return apiError("Failed to update task", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const task = await getOwnedTask(params.id, (session.user as { id: string }).id);
    if (!task) return apiError("Task not found", 404);

    await task.deleteOne();
    return apiSuccess({ id: params.id }, "Task deleted");
  } catch (err) {
    console.error("[TASK_DELETE_ERROR]", err);
    return apiError("Failed to delete task", 500);
  }
}
