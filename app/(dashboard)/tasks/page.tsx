import { TaskListView } from "@/components/tasks/task-list";

export const metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage, filter, and organize everything on your plate.</p>
      </div>
      <TaskListView />
    </div>
  );
}
