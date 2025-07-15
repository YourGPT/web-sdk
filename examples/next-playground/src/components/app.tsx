"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Todo } from "@/types/todo";
import { Navigation } from "@/components/navigation";
import { TodoList } from "@/components/todo-app";
import { KanbanBoard } from "@/components/kanban-board";
import { YourGPT, useAIActions } from "@yourgpt/widget-web-sdk/react";

// Initialize SDK
YourGPT.init({
  widgetId: process.env.NEXT_PUBLIC_WIDGET_UID!,
  endpoint: process.env.NEXT_PUBLIC_WIDGET_ENDPOINT!,
  debug: true,
});

interface AppProps {
  view: "list" | "kanban";
}

export function App({ view }: AppProps) {
  const currentView = view;
  const [todos, setTodos] = useState<Todo[]>([]);

  const aiActions = useAIActions();

  const applyTheme = (theme: string) => {
    document.documentElement.className = theme === "light" ? "" : theme;
    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    // Register location action
    aiActions.registerAction("get_location", async (data, helpers) => {
      const confirmed = await helpers.confirm({
        title: "Location Access",
        description: "This React app wants to access your location. Allow?",
        acceptLabel: "Allow",
        rejectLabel: "Deny",
      });

      if (!confirmed) {
        helpers.respond("Location access denied by user");
        return;
      }

      if (!navigator.geolocation) {
        helpers.respond("Geolocation not supported by this browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          helpers.respond(`Current location: ${latitude}, ${longitude}`);
        },
        (error) => {
          helpers.respond(`Failed to get location: ${error.message}`);
        }
      );
    });

    aiActions.registerAction("change_theme", async (data, helpers) => {
      console.log("change_theme", data);

      const processData: any = data.action?.tool?.function || {};
      const args = processData.arguments || `{}`;
      const theme = JSON.parse(args).theme;

      applyTheme(theme);

      helpers.respond("Theme changed to " + theme);
    });

    return () => {
      aiActions.unregisterAction("get_location");
      aiActions.unregisterAction("change_theme");
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
