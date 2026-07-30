import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { taskSchema } from "@/validators/task";
import { apiError, apiSuccess } from "@/lib/utils";
import type { FilterQuery } from "mongoose";
import type { ITask } from "@/models/Task";
import Task from "@/models/Task";
import "@/models/Category"; // register Category schema for .populate("category", ...)

/**
 * GET /api/tasks
 * Supports: search, status, priority, category, tag, pinned, favorite,
 * archived, sortBy, page, limit
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const pinned = searchParams.get("pinned");
    const favorite = searchParams.get("favorite");
    const archived = searchParams.get("archived");
    const sortBy = searchParams.get("sortBy") ?? "newest";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

    const query: FilterQuery<ITask> = {
      userId: (session.user as { id: string }).id,
    };

    if (search) query.$text = { $search: search };
    if (status && status !== "all") query.status = status;
    if (priority && priority !== "all") query.priority = priority;
    if (category && category !== "all") query.category = category;
    if (tag) query.tags = tag;
    if (pinned === "true") query.pinned = true;
    if (favorite === "true") query.favorite = true;
    // Default: hide archived tasks unless explicitly requested
    query.archived = archived === "true";

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { pinned: -1, createdAt: -1 },
      oldest: { pinned: -1, createdAt: 1 },
      priority: { pinned: -1, priority: -1, createdAt: -1 },
      alphabetical: { title: 1 },
      dueDate: { pinned: -1, dueDate: 1 },
    };

    const sort = sortMap[sortBy] ?? sortMap.newest;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("category", "name color icon")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return apiSuccess(
      { tasks, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
      "Tasks fetched"
    );
  } catch (err) {
    console.error("[TASKS_GET_ERROR]", err);
    return apiError("Failed to fetch tasks", 500);
  }
}

/** POST /api/tasks — create a new task */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();

    const task = await Task.create({
      ...parsed.data,
      userId: (session.user as { id: string }).id,
    });

    return apiSuccess(task, "Task created", 201);
  } catch (err) {
    console.error("[TASKS_POST_ERROR]", err);
    return apiError("Failed to create task", 500);
  }
}
