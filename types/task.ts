export type ColumnType = "todo" | "inprogress" | "done";

export type ApiTaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: ColumnType;

  // Frontend ordering; persistence requires a database column.
  order_index: number;

  // Legacy UI field; not currently stored in the PostgreSQL table.
  created_by: string;

  priority?: TaskPriority;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function toApiStatus(status: ColumnType): ApiTaskStatus {
  const statusMap: Record<ColumnType, ApiTaskStatus> = {
    todo: "TODO",
    inprogress: "IN_PROGRESS",
    done: "DONE",
  };

  return statusMap[status];
}

export function toColumnType(status: ApiTaskStatus): ColumnType {
  const statusMap: Record<ApiTaskStatus, ColumnType> = {
    TODO: "todo",
    IN_PROGRESS: "inprogress",
    DONE: "done",
  };

  return statusMap[status];
}
