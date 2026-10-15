export type ColumnType = "todo" | "inprogress" | "done";

export interface Task {
  id: string;

  title: string;

  description: string;

  status: ColumnType;

  order_index: number;

  created_by: string;
}
