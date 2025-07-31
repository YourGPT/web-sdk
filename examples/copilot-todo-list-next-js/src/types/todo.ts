export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags?: string[];
  assignee?: string;
  category?: string;
}

export interface Column {
  id: Status;
  title: string;
  description: string;
  color: string;
}

export const COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    description: "Tasks ready to be started",
    color: "bg-slate-100 border-slate-200"
  },
  {
    id: "in_progress",
    title: "In Progress",
    description: "Currently being worked on",
    color: "bg-blue-50 border-blue-200"
  },
  {
    id: "done",
    title: "Done",
    description: "Completed tasks",
    color: "bg-green-50 border-green-200"
  }
];

export const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "bg-green-100 text-green-800 border-green-300",
    darkColor: "bg-green-900 text-green-100 border-green-700",
    icon: "○"
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    darkColor: "bg-yellow-900 text-yellow-100 border-yellow-700",
    icon: "◐"
  },
  high: {
    label: "High",
    color: "bg-red-100 text-red-800 border-red-300",
    darkColor: "bg-red-900 text-red-100 border-red-700",
    icon: "●"
  }
};