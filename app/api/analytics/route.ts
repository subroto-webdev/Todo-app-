import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { apiError, apiSuccess } from "@/lib/utils";
import { subDays, startOfDay, format } from "date-fns";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const userId = new mongoose.Types.ObjectId((session.user as { id: string }).id);
    const now = new Date();
    const since = subDays(now, 29);

    const [statusAgg, priorityAgg, categoryAgg, trendAgg, overview] = await Promise.all([
      Task.aggregate([
        { $match: { userId, archived: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { userId, archived: false } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { userId, archived: false, category: { $ne: null } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            name: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
            color: { $ifNull: ["$categoryInfo.color", "#64748b"] },
            count: 1,
          },
        },
      ]),
      Task.aggregate([
        {
          $match: {
            userId,
            completedAt: { $gte: startOfDay(since) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        { $match: { userId, archived: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ["$dueDate", now] },
                      { $ne: ["$status", "completed"] },
                      { $ne: ["$dueDate", null] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    // Fill in missing days for a continuous 30-day trend line
    const trendMap = new Map(trendAgg.map((d) => [d._id, d.count]));
    const trend = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(now, 29 - i);
      const key = format(date, "yyyy-MM-dd");
      return { date: key, count: trendMap.get(key) ?? 0 };
    });

    const stats = overview[0] ?? { total: 0, completed: 0, overdue: 0 };
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return apiSuccess(
      {
        statusDistribution: statusAgg.map((s) => ({ status: s._id, count: s.count })),
        priorityDistribution: priorityAgg.map((p) => ({ priority: p._id, count: p.count })),
        categoryDistribution: categoryAgg,
        completionTrend: trend,
        overview: {
          total: stats.total,
          completed: stats.completed,
          overdue: stats.overdue,
          completionRate,
        },
      },
      "Analytics fetched"
    );
  } catch (err) {
    console.error("[ANALYTICS_GET_ERROR]", err);
    return apiError("Failed to fetch analytics", 500);
  }
}
