"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Todo, Status, Priority } from "@/types/todo";
import { Navigation } from "@/components/navigation";
import { TodoList } from "@/components/todo-app";
import { KanbanBoard } from "@/components/kanban-board";
import { YourGPT, useAIActions } from "@yourgpt/widget-web-sdk/react";
import { useTheme, type Theme } from "@/components/theme-provider";

// Initialize SDK
YourGPT.init({
  widgetId: "271f1c55-4a82-4c7f-9634-762078763943",
  endpoint: "https://dev-widget.yourgpt.ai",
  debug: true,
});

interface ToolFunction {
  arguments: string;
  name: string;
}

interface ActionData {
  action: {
    tool: {
      function: ToolFunction;
    };
  };
}

interface AppProps {
  view: "list" | "kanban";
}

export function App({ view }: AppProps) {
  const currentView = view;
  const [todos, setTodos] = useState<Todo[]>([]);
  const { changeTheme } = useTheme();

  const aiActions = useAIActions();

  // Use callback to prevent infinite re-renders with useEffect
  const themeActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
    const actionData = data as ActionData;
    const args = actionData.action?.tool?.function?.arguments || `{}`;
    const theme = JSON.parse(args).theme as Theme;

    changeTheme(theme);
    action.respond("Theme changed to " + theme);
  }, [changeTheme]);

  // Universal bulk delete function for todos based on status, category, and priority
  const bulkDeleteActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
    const actionData = data as ActionData;
    const args = actionData.action?.tool?.function?.arguments || `{}`;
    let parsedArgs;
    try {
      parsedArgs = JSON.parse(args);
    } catch {
      action.respond("Error parsing arguments.");
      return;
    }

    const { status, category, priority, tag } = parsedArgs;

    // If no filters provided, default to deleting only completed tasks for safety
    if (!status && !category && !priority && !tag) {
      setTodos((prevTodos) => {
        const remainingTodos = prevTodos.filter(todo => todo.status !== "done");
        const deletedCount = prevTodos.length - remainingTodos.length;
        action.respond(`Successfully deleted ${deletedCount} completed tasks.`);
        return remainingTodos;
      });
      return;
    }

    let deletedCount = 0;
    let filterText = "";

    setTodos((prevTodos) => {
      const remainingTodos = prevTodos.filter(todo => {
        // Check if todo matches any of the deletion criteria
        const matchesStatus = !status || todo.status === status;
        const matchesCategory = !category || todo.category === category;
        const matchesPriority = !priority || todo.priority === priority;
        const matchesTag = !tag || (todo.tags && todo.tags.includes(tag));

        // Keep todos that DON'T match all the specified criteria
        return !(matchesStatus && matchesCategory && matchesPriority && matchesTag);
      });

      deletedCount = prevTodos.length - remainingTodos.length;

      // Build response message
      const filters = [];
      if (status) filters.push(`status "${status.replace("_", " ")}"`);
      if (category) filters.push(`category "${category}"`);
      if (priority) filters.push(`${priority} priority`);
      if (tag) filters.push(`tag "${tag}"`);

      filterText = filters.length > 0 ? ` with ${filters.join(", ")}` : "";

      return remainingTodos;
    });
    action.respond(`Successfully deleted ${deletedCount} task${deletedCount !== 1 ? 's' : ''}${filterText}.`);
  }, []);

  // Universal move function for todos based on category, priority, and status
  const moveTodosActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
    const actionData = data as ActionData;
    const args = actionData.action?.tool?.function?.arguments || `{}`;
    let parsedArgs;
    try {
      parsedArgs = JSON.parse(args);
    } catch {
      action.respond("Error parsing arguments.");
      return;
    }

    const { category, priority, from, to, tag } = parsedArgs;

    // Validate required parameters
    if (!from || !to) {
      action.respond("Error: 'from' and 'to' status are required.");
      return;
    }

    // Validate status values
    const validStatuses = ["todo", "in_progress", "done"];
    if (!validStatuses.includes(from) || !validStatuses.includes(to)) {
      action.respond("Error: Invalid status. Valid statuses are: todo, in_progress, done");
      return;
    }

    let filterText = "";
    let fromText = ''
    let toText = ''
    let movedCount = 0

    setTodos((prevTodos) => {
      const updatedTodos = prevTodos.map(todo => {
        // Check if todo matches all the criteria
        const matchesStatus = todo.status === from;
        const matchesCategory = !category || todo.category === category;
        const matchesPriority = !priority || todo.priority === priority;
        const matchesTag = !tag || (todo.tags && todo.tags.includes(tag));

        if (matchesStatus && matchesCategory && matchesPriority && matchesTag) {
          return {
            ...todo,
            status: to as Status,
            updatedAt: new Date()
          };
        }
        return todo;
      });

      // Count moved todos
      movedCount = updatedTodos.filter(todo =>
        todo.status === to &&
        prevTodos.some(pt =>
          pt.id === todo.id &&
          pt.status === from &&
          (!category || pt.category === category) &&
          (!priority || pt.priority === priority) &&
          (!tag || (pt.tags && pt.tags.includes(tag)))
        )
      ).length;

      // Build response message
      const filters = [];
      if (category) filters.push(`category "${category}"`);
      if (priority) filters.push(`${priority} priority`);
      if (tag) filters.push(`tag "${tag}"`);
      filterText = filters.length > 0 ? ` with ${filters.join(", ")}` : "";
      fromText = from.replace("_", " ");
      toText = to.replace("_", " ");

      return updatedTodos;
    });
    action.respond(`Moved ${movedCount} task${movedCount !== 1 ? 's' : ''}${filterText} from ${fromText} to ${toText}.`);
  },

    []);

  const beastModeActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
    changeTheme("forest");
    action.respond("🔥 Beast mode activated! 🔥");
  }, [changeTheme]);

  const deactivateBeastModeActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
    changeTheme("light");
    action.respond("✨ Beast mode deactivated! Back to normal. ✨");
  }, []);

  // AI Action to read all todos from each board
  const readTodosActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
    // Organize todos by board/status
    const todosByBoard = {
      todo: todos.filter(todo => todo.status === "todo"),
      in_progress: todos.filter(todo => todo.status === "in_progress"),
      done: todos.filter(todo => todo.status === "done")
    };

    const response = `📊 All Todo Boards:\n\n` +
      `🟡 TO DO (${todosByBoard.todo.length} tasks):\n` +
      (todosByBoard.todo.length === 0 ? "   No pending tasks\n" :
        todosByBoard.todo.map((todo, index) =>
          `   ${index + 1}. ${todo.title}${todo.category ? ` [${todo.category}]` : ""}`
        ).join("\n") + "\n") +
      `\n🔵 IN PROGRESS (${todosByBoard.in_progress.length} tasks):\n` +
      (todosByBoard.in_progress.length === 0 ? "   No tasks in progress\n" :
        todosByBoard.in_progress.map((todo, index) =>
          `   ${index + 1}. ${todo.title}${todo.category ? ` [${todo.category}]` : ""}`
        ).join("\n") + "\n") +
      `\n🟢 DONE (${todosByBoard.done.length} tasks):\n` +
      (todosByBoard.done.length === 0 ? "   No completed tasks\n" :
        todosByBoard.done.map((todo, index) =>
          `   ${index + 1}. ${todo.title}${todo.category ? ` [${todo.category}]` : ""}`
        ).join("\n") + "\n");

    action.respond(response);
  }, [todos]);

  // Bulk create tasks function
  const createBulkTasksActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
    const actionData = data as ActionData;
    const args = actionData.action?.tool?.function?.arguments || `{}`;
    let parsedArgs;
    try {
      parsedArgs = JSON.parse(args);
    } catch {
      action.respond("Error parsing arguments.");
      return;
    }

    const { from, to, category, priority, tag, csv } = parsedArgs;

    // Function to parse CSV data
    const parseCSV = (csvData: string): { category: string; priority: string; title: string }[] => {
      const lines = csvData.trim().split('\n');
      const rows = [];

      // Skip header row and process data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle CSV parsing with potential commas in task descriptions
        // Split by comma but be smart about it
        const firstCommaIndex = line.indexOf(',');
        const secondCommaIndex = line.indexOf(',', firstCommaIndex + 1);

        if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
          const category = line.substring(0, firstCommaIndex).trim();
          const priority = line.substring(firstCommaIndex + 1, secondCommaIndex).trim().toLowerCase();
          const title = line.substring(secondCommaIndex + 1).trim();

          rows.push({
            category,
            priority,
            title
          });
        }
      }
      return rows;
    };

    const tasks: Todo[] = [];
    const currentDate = new Date();

    // Check if CSV data is provided
    if (csv) {
      try {
        const csvRows = parseCSV(csv);

        if (csvRows.length === 0) {
          action.respond("Error: No valid rows found in CSV data.");
          return;
        }

        // Create tasks from CSV data
        csvRows.forEach((row, index) => {
          // Validate and normalize priority
          let taskPriority: Priority = "medium";
          if (["low", "medium", "high"].includes(row.priority)) {
            taskPriority = row.priority as Priority;
          }

          const newTask: Todo = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
            title: row.title,
            priority: taskPriority,
            status: "todo",
            createdAt: new Date(currentDate.getTime() + index), // Slightly different timestamps
            updatedAt: new Date(currentDate.getTime() + index),
            category: row.category || undefined,
            tags: tag ? [tag] : undefined
          };

          tasks.push(newTask);
        });

        // Add all tasks to the todo list
        setTodos(prevTodos => [...tasks, ...prevTodos]);

        // Build response message for CSV import
        const taskCount = tasks.length;
        const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
        const priorities = [...new Set(tasks.map(t => t.priority))];

        action.respond(
          `Successfully created ${taskCount} task${taskCount !== 1 ? 's' : ''} from CSV data. ` +
          `Categories: ${categories.join(', ')}. ` +
          `Priorities: ${priorities.join(', ')}.`
        );
        return;

      } catch {
        action.respond("Error parsing CSV data. Please check the format.");
        return;
      }
    }

    // Original functionality for range-based task creation
    // Validate required parameters for range mode
    if (!from || !to) {
      action.respond("Error: Either provide 'csv' data for CSV import, or 'from' and 'to' parameters for range-based task creation.");
      return;
    }

    // Validate priority if provided
    if (priority && !["low", "medium", "high"].includes(priority)) {
      action.respond("Error: Invalid priority. Valid priorities are: low, medium, high");
      return;
    }

    // Create a task for each item in the range
    const fromNum = parseInt(from);
    const toNum = parseInt(to);

    if (isNaN(fromNum) || isNaN(toNum)) {
      action.respond("Error: 'from' and 'to' must be valid numbers.");
      return;
    }

    for (let i = fromNum; i <= toNum; i++) {
      const newTask: Todo = {
        id: `${Date.now()}-${i}`,
        title: `Task ${i}`,
        priority: (priority as Priority) || "medium",
        status: "todo",
        createdAt: currentDate,
        updatedAt: currentDate,
        category: category || undefined,
        tags: tag ? [tag] : undefined
      };
      tasks.push(newTask);
    }

    // Add all tasks to the todo list
    setTodos(prevTodos => [...tasks, ...prevTodos]);

    // Build response message
    const taskCount = tasks.length;
    const filters = [];
    if (category) filters.push(`category "${category}"`);
    if (priority) filters.push(`${priority} priority`);
    if (tag) filters.push(`tag "${tag}"`);

    const filterText = filters.length > 0 ? ` with ${filters.join(", ")}` : "";
    action.respond(`Successfully created ${taskCount} task${taskCount !== 1 ? 's' : ''}${filterText}.`);
  }, []);

  // Register the AI action only once when the component mounts
  useEffect(() => {
    aiActions.registerAction("change_theme", themeActionRef);
    aiActions.registerAction("bulk_delete", bulkDeleteActionRef);
    aiActions.registerAction("move_todos", moveTodosActionRef);
    aiActions.registerAction("create_bulk_tasks", createBulkTasksActionRef);
    aiActions.registerAction("beast_mode", beastModeActionRef);
    aiActions.registerAction("deactivate_beast_mode", deactivateBeastModeActionRef);
    aiActions.registerAction("read_todos", readTodosActionRef);

    return () => {
      aiActions.unregisterAction("change_theme");
      aiActions.unregisterAction("bulk_delete");
      aiActions.unregisterAction("move_todos");
      aiActions.unregisterAction("create_bulk_tasks");
      aiActions.unregisterAction("beast_mode");
      aiActions.unregisterAction("deactivate_beast_mode");
      aiActions.unregisterAction("read_todos");
    };
  }, []);



  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map(
          (
            todo: Todo & {
              createdAt: string;
              updatedAt: string;
              dueDate?: string;
            }
          ) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          })
        );
        setTodos(parsedTodos);
      } catch (error) {
        console.error("Error parsing todos from localStorage:", error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setTodos((prevTodos) => {
      const existingTodoIndex = prevTodos.findIndex((todo) => todo.id === updatedTodo.id);

      if (existingTodoIndex >= 0) {
        // Update existing todo
        const newTodos = [...prevTodos];
        newTodos[existingTodoIndex] = updatedTodo;
        return newTodos;
      } else {
        // Add new todo
        return [updatedTodo, ...prevTodos];
      }
    });
  };

  const handleCreateTodo = (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} />

      <main className="container mx-auto px-0 py-8">
        <motion.div key={currentView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {currentView === "list" ? (
            <TodoList todos={todos} onUpdateTodo={handleUpdateTodo} onCreateTodo={handleCreateTodo} onDeleteTodo={handleDeleteTodo} />
          ) : (
            <KanbanBoard todos={todos} onUpdateTodo={handleUpdateTodo} onCreateTodo={handleCreateTodo} onDeleteTodo={handleDeleteTodo} />
          )}
        </motion.div>
      </main>
    </div>
  );
}
