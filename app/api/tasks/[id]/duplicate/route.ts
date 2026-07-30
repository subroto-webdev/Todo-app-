import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { apiError, apiSuccess } from "@/lib/utils";
import mongoose from "mongoose";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);
    if (!mongoose.Types.ObjectId.isValid(params.id)) return apiError("Invalid task id", 400);

    await connectDB();
    const userId = (session.user as { id: string }).id;
    const original = await Task.findOne({ _id: params.id, userId }).lean();
    if (!original) return apiError("Task not found", 404);

    const { _id, createdAt, updatedAt, ...rest } = original as any;

    const copy = await Task.create({
      ...rest,
      title: `${rest.title} (Copy)`,
      status: "pending",
      completedAt: null,
      pinned: false,
    });

    return apiSuccess(copy, "Task duplicated", 201);
  } catch (err) {
    console.error("[TASK_DUPLICATE_ERROR]", err);
    return apiError("Failed to duplicate task", 500);
  }
}
