import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { startOfDay, endOfDay } from "date-fns";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  await connectDB();

  const now = new Date();
  const [total, completed, pending, overdue, dueToday, recent, upcoming] = await Promise.all([
    Task.countDocuments({ userId, archived: false }),
    Task.countDocuments({ userId, archived: false, status: "completed" }),
    Task.countDocuments({ userId, archived: false, status: { $in: ["pending", "in-progress"] } }),
    Task.countDocuments({
      userId,
      archived: false,
      status: { $ne: "completed" },
      dueDate: { $lt: now, $ne: null },
    }),
    Task.countDocuments({
      userId,
      archived: false,
      dueDate: { $gte: startOfDay(now), $lte: endOfDay(now) },
    }),
    Task.find({ userId, archived: false }).sort({ updatedAt: -1 }).limit(5).lean(),
    Task.find({
      userId,
      archived: false,
      status: { $ne: "completed" },
      dueDate: { $gte: now },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .lean(),
  ]);

  const name = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {name} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          You have {pending} task{pending === 1 ? "" : "s"} in progress and {dueToday} due today.
        </p>
      </div>

      <OverviewCards total={total} completed={completed} pending={pending} overdue={overdue} />

      <DashboardClient
        recent={JSON.parse(JSON.stringify(recent))}
        upcoming={JSON.parse(JSON.stringify(upcoming))}
      />
    </div>
  );
}
