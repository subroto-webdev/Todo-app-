import { create } from "zustand";
import type { Task } from "@/types";

interface UIStore {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  taskModalOpen: boolean;
  editingTask: Task | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openTaskModal: (task?: Task | null) => void;
  closeTaskModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  taskModalOpen: false,
  editingTask: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  openTaskModal: (task = null) => set({ taskModalOpen: true, editingTask: task }),
  closeTaskModal: () => set({ taskModalOpen: false, editingTask: null }),
}));
