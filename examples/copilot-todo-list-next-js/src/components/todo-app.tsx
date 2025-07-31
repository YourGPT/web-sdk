"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Todo, PRIORITY_CONFIG } from "@/types/todo";
import { CreateTodoForm } from "./create-todo-form";

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const priorityColorsDark = {
  low: "bg-green-900 text-green-100 border-green-800",
  medium: "bg-yellow-900 text-yellow-100 border-yellow-800",
  high: "bg-red-900 text-red-100 border-red-800",
};

interface TodoListProps {
  todos: Todo[];
  onUpdateTodo: (todo: Todo) => void;
  onCreateTodo: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteTodo: (id: string) => void;
}

export function TodoList({ todos, onUpdateTodo, onCreateTodo, onDeleteTodo }: TodoListProps) {
  const toggleTodo = (todo: Todo) => {
    const updatedTodo = {
      ...todo,
      status: todo.status === "done" ? "todo" : "done",
      updatedAt: new Date(),
    } as Todo;
    onUpdateTodo(updatedTodo);
  };

  const completedCount = todos.filter((todo) => todo.status === "done").length;
  const totalCount = todos.length;

  const handleCreateTodo = (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onCreateTodo(newTodo);
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task List</h1>
          <p className="text-muted-foreground">Manage your tasks with a simple checklist view</p>
        </div>
        <CreateTodoForm onCreateTodo={handleCreateTodo} />
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-blue-600">{totalCount - completedCount}</p>
                </div>
                <Circle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {todos.map((todo) => (
            <motion.div key={todo.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.3 }} layout>
              <Card className={cn("transition-all duration-200", todo.status === "done" && "opacity-75 bg-muted/50")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Checkbox checked={todo.status === "done"} onCheckedChange={() => toggleTodo(todo)} />
                    </motion.div>

                    <div className="flex-1">
                      <motion.p
                        className={cn("transition-all duration-200 font-medium", todo.status === "done" && "line-through text-muted-foreground")}
                        animate={{
                          textDecoration: todo.status === "done" ? "line-through" : "none",
                        }}
                      >
                        {todo.title}
                      </motion.p>
                      {todo.description && <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={cn("text-xs", priorityColors[todo.priority], "dark:" + priorityColorsDark[todo.priority])}>
                          <span className="mr-1">{PRIORITY_CONFIG[todo.priority].icon}</span>
                          {PRIORITY_CONFIG[todo.priority].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{todo.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="sm" onClick={() => onDeleteTodo(todo.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {todos.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="text-center py-12">
              <CardContent>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground">Create your first task to get started!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
