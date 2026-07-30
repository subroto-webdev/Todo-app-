import { create } from "zustand";
import type { Task, TaskFilters } from "@/types";

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  filters: TaskFilters;
  selectedIds: string[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  removeTasks: (ids: string[]) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

const defaultFilters: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  sortBy: "newest",
  archived: false,
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  filters: defaultFilters,
  selectedIds: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...patch } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) })),
  removeTasks: (ids) =>
    set((state) => ({ tasks: state.tasks.filter((t) => !ids.includes(t._id)) })),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((s) => s !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
  selectAll: (ids) => set({ selectedIds: ids }),
}));
