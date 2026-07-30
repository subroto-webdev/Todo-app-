import { CalendarView } from "@/components/tasks/calendar-view";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">See what's due, at a glance.</p>
      </div>
      <CalendarView />
    </div>
  );
}
