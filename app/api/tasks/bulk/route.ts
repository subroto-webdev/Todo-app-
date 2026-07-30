import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { bulkActionSchema } from "@/validators/task";
import { apiError, apiSuccess } from "@/lib/utils";

const actionToUpdate = (action: string, category?: string | null) => {
  switch (action) {
    case "complete":
      return { status: "completed", completedAt: new Date() };
    case "archive":
      return { archived: true, status: "archived" };
    case "restore":
      return { archived: false, status: "pending" };
    case "favorite":
      return { favorite: true };
    case "unfavorite":
      return { favorite: false };
    case "pin":
      return { pinned: true };
    case "unpin":
      return { pinned: false };
    case "move":
      return { category };
    default:
      return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = bulkActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const userId = (session.user as { id: string }).id;
    const { ids, action, category } = parsed.data;

    if (action === "delete") {
      const result = await Task.deleteMany({ _id: { $in: ids }, userId });
      return apiSuccess({ deletedCount: result.deletedCount }, "Tasks deleted");
    }

    const update = actionToUpdate(action, category);
    if (!update) return apiError("Unsupported bulk action", 400);

    const result = await Task.updateMany({ _id: { $in: ids }, userId }, { $set: update });

    return apiSuccess({ modifiedCount: result.modifiedCount }, "Tasks updated");
  } catch (err) {
    console.error("[TASKS_BULK_ERROR]", err);
    return apiError("Failed to perform bulk action", 500);
  }
}
