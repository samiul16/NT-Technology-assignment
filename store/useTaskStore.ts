import { create } from "zustand";
import { Task, ColumnType, CreateTaskRequest } from "@/types/task";
import Cookies from "js-cookie";

interface TaskState {
  tasks: Task[];
  notification: string | null;
  searchQuery: string;

  setNotification: (msg: string | null) => void;
  setSearchQuery: (query: string) => void;
  fetchTasks: () => Promise<void>;

  moveTask: (
    taskId: string,
    newStatus: ColumnType,
    newOrder: number,
    userName: string
  ) => Promise<void>;

  updateTask: (
    taskId: string,
    title: string,
    description: string,
    priority: string,
    dueDate: string | null
  ) => Promise<void>;

  addTask: (data: CreateTaskRequest, userName: string) => Promise<void>;
  initRealtime: () => void;

  deleteTask: (taskId: string) => Promise<void>;
}

type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const toApiStatus = (status: ColumnType): ApiTask["status"] => {
  const statuses: Record<ColumnType, ApiTask["status"]> = {
    todo: "TODO",
    inprogress: "IN_PROGRESS",
    done: "DONE",
  };

  return statuses[status];
};

const toFrontendTask = (task: ApiTask): Task =>
  ({
    ...task,
    status: (
      {
        TODO: "todo",
        IN_PROGRESS: "inprogress",
        DONE: "done",
      } as const
    )[task.status],
    description: task.description ?? "",
    order_index: 0,
  } as Task);

async function readResponse<T>(response: Response): Promise<T> {
  const result = (await response.json()) as ApiResponse<T> & {
    task?: T;
    tasks?: T;
  };

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Task request failed");
  }

  const data = result.data ?? result.task ?? result.tasks;

  if (data === undefined) {
    throw new Error("The API response does not contain task data.");
  }

  return data;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  notification: null,
  searchQuery: "",

  setNotification: (msg) => set({ notification: msg }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchTasks: async () => {
    try {
      const response = await fetch("/api/tasks");
      const apiTasks = await readResponse<ApiTask[]>(response);

      set({ tasks: apiTasks.map(toFrontendTask) });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      set({ notification: "Could not load tasks." });
    }
  },

  addTask: async (data, _userName) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          status: toApiStatus(data.status),
          priority: "MEDIUM",
          due_date: data.due_date || null,
        }),
      });

      const createdTask = await readResponse<ApiTask>(response);

      set((state) => ({
        tasks: [...state.tasks, toFrontendTask(createdTask)],
        notification: null,
      }));
    } catch (error) {
      console.error("Failed to create task:", error);
      set({ notification: "Could not create task." });
      throw error;
    }
  },

  moveTask: async (taskId, newStatus, _newOrder, _userName) => {
    const previousTasks = get().tasks;

    set({
      tasks: previousTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    });

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: toApiStatus(newStatus),
        }),
      });

      const updatedTask = await readResponse<ApiTask>(response);

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? toFrontendTask(updatedTask) : task
        ),
        notification: null,
      }));
    } catch (error) {
      console.error("Failed to move task:", error);

      set({
        tasks: previousTasks,
        notification: "Could not save task status.",
      });
    }
  },

  updateTask: async (taskId, title, description, priority, dueDate) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          priority: priority.toUpperCase(),
          due_date: dueDate
            ? new Date(`${dueDate}T12:00:00`).toISOString()
            : null,
        }),
      });

      const updatedTask = await readResponse<ApiTask>(response);

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? toFrontendTask(updatedTask) : task
        ),
        notification: null,
      }));
    } catch (error) {
      console.error("Failed to update task:", error);

      set({
        notification: "Could not update task.",
      });

      throw error;
    }
  },

  initRealtime: () => {
    // Task data now comes from the Prisma API.
    // Supabase database subscriptions are intentionally removed.
    // Broadcast notifications can be added back separately if needed.
    const currentUser = Cookies.get("user-auth");

    if (!currentUser) return;

    // Keep initialization safe until a notification provider is configured.
  },

  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
        notification: null,
      }));
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({ notification: "Could not delete task." });
      throw error;
    }
  },
}));
