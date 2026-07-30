import { KanbanBoard } from "@/components/tasks/kanban-board";

export const metadata = { title: "Kanban Board" };

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workflow Visualizer</h1>
        <p className="text-sm text-muted-foreground mt-1">Drag and drop tasks between stages.</p>
      </div>
      <KanbanBoard />
    </div>
  );
}
