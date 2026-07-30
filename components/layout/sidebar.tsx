"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CheckSquare, Plus, X } from "lucide-react";
import { NAV_ITEMS } from "@/constants";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, openTaskModal } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl lg:static lg:translate-x-0 lg:z-0"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 text-white shadow-sm">
              <CheckSquare className="h-4.5 w-4.5" />
            </span>
            TaskFlow
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pb-2">
          <Button variant="gradient" className="w-full" onClick={() => openTaskModal()}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", active && "text-primary-600 dark:text-primary-400")} />
                {item.label}
                {active && (
                  <motion.span
                    layoutId="sidebar-active-dot"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-400">
          Press <kbd className="rounded border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 font-mono">⌘K</kbd> for quick actions
        </div>
      </motion.aside>
    </>
  );
}
