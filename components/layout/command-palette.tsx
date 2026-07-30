"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  CalendarDays,
  BarChart3,
  Settings,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useUIStore } from "@/store/useUIStore";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, openTaskModal } = useUIStore();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const go = (href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="glass-card relative z-10 w-full max-w-lg overflow-hidden p-0"
          >
            <Command
              shouldFilter
              value={search}
              onValueChange={setSearch}
              className="[&_[cmdk-input]]:h-12 [&_[cmdk-input]]:w-full [&_[cmdk-input]]:border-b [&_[cmdk-input]]:border-slate-200 [&_[cmdk-input]]:dark:border-slate-800 [&_[cmdk-input]]:bg-transparent [&_[cmdk-input]]:px-4 [&_[cmdk-input]]:text-sm [&_[cmdk-input]]:outline-none"
            >
              <Command.Input placeholder="Type a command or search…" autoFocus />
              <Command.List className="max-h-80 overflow-y-auto scrollbar-thin p-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-400">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Quick actions" className="px-2 py-1.5 text-xs font-medium text-slate-400">
                  <Command.Item
                    onSelect={() => {
                      openTaskModal();
                      setCommandPaletteOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-primary-50 dark:aria-selected:bg-primary-500/10"
                  >
                    <Plus className="h-4 w-4" /> Create new task
                  </Command.Item>
                  <Command.Item
                    onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-primary-50 dark:aria-selected:bg-primary-500/10"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    Toggle theme
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Navigate" className="px-2 py-1.5 text-xs font-medium text-slate-400">
                  {[
                    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                    { label: "Tasks", href: "/tasks", icon: ListTodo },
                    { label: "Workflow Visualizer", href: "/kanban", icon: KanbanSquare },
                    { label: "Calendar", href: "/calendar", icon: CalendarDays },
                    { label: "Analytics", href: "/analytics", icon: BarChart3 },
                    { label: "Settings", href: "/settings", icon: Settings },
                  ].map((item) => (
                    <Command.Item
                      key={item.href}
                      onSelect={() => go(item.href)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-primary-50 dark:aria-selected:bg-primary-500/10"
                    >
                      <item.icon className="h-4 w-4" /> {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
