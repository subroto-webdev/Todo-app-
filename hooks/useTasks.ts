"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTaskStore } from "@/store/useTaskStore";
import { taskService } from "@/services/taskService";
import { useDebounce } from "@/hooks/useDebounce";

export function useTasks() {
  const { tasks, filters, isLoading, setTasks, setLoading } = useTaskStore();
  const debouncedSearch = useDebounce(filters.search, 300);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { tasks } = await taskService.list({ ...filters, search: debouncedSearch });
      setTasks(tasks);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.status,
    filters.priority,
    filters.category,
    filters.sortBy,
    filters.archived,
    filters.pinned,
    filters.favorite,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, isLoading, refetch: fetchTasks };
}
