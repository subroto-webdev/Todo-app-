import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { TaskFormModal } from "@/components/tasks/task-form";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">{children}</main>
      </div>
      <CommandPalette />
      <TaskFormModal />
    </div>
  );
}
