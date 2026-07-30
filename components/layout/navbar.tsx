"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { Menu, Moon, Sun, Search, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useTaskStore } from "@/store/useTaskStore";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export function Navbar() {
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const { filters, setFilters } = useTaskStore();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-4 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 text-sm text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
      >
        <Search className="h-4 w-4" />
        Search tasks…
        <kbd className="ml-auto rounded border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 text-xs font-mono">⌘K</kbd>
      </button>

      <div className="relative flex-1 md:hidden">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Search…"
          className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-9 pr-3 text-sm outline-none focus:border-primary-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 text-sm font-semibold text-white btn-focus"
          >
            {session?.user?.name ? getInitials(session.user.name) : <User className="h-4 w-4" />}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="glass-card absolute right-0 z-20 mt-2 w-56 p-1.5 animate-scale-in origin-top-right">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                  <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMenuOpen(false)}
                >
                  <SettingsIcon className="h-4 w-4" /> Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
