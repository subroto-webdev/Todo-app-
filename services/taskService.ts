import type { ApiResponse, Task, TaskFilters } from "@/types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data as T;
}

export function buildTaskQuery(filters: Partial<TaskFilters>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    params.set(key, String(value));
  });
  return params.toString();
}

export const taskService = {
  list: (filters: Partial<TaskFilters> = {}) =>
    request<{ tasks: Task[]; pagination: any }>(`/api/tasks?${buildTaskQuery(filters)}`),

  create: (payload: Partial<Task>) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: Partial<Task>) =>
    request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: string) => request<{ id: string }>(`/api/tasks/${id}`, { method: "DELETE" }),

  duplicate: (id: string) => request<Task>(`/api/tasks/${id}/duplicate`, { method: "POST" }),

  bulk: (ids: string[], action: string, category?: string) =>
    request<{ modifiedCount?: number; deletedCount?: number }>("/api/tasks/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action, category }),
    }),
};

export const categoryService = {
  list: () => request<any[]>("/api/categories"),
  create: (payload: { name: string; color: string; icon?: string }) =>
    request<any>("/api/categories", { method: "POST", body: JSON.stringify(payload) }),
};

export const analyticsService = {
  get: () => request<any>("/api/analytics"),
};
