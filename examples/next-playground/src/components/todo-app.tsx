"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, CheckCircle2, Circle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Priority = "low" | "medium" | "high";
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
};

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

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        priority,
        createdAt: new Date(),
      };
      setTodos([todo, ...todos]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Todo List
            </CardTitle>
            <CardDescription>
              Manage your tasks efficiently with priorities and animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a new todo..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Button onClick={addTodo} className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {totalCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 text-sm text-muted-foreground"
              >
                <span>Total: {totalCount}</span>
                <span>Completed: {completedCount}</span>
                <span>Remaining: {totalCount - completedCount}</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Card className={cn(
              "transition-all duration-200",
              todo.completed && "opacity-75 bg-muted/50"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                    />
                  </motion.div>
                  
                  <div className="flex-1">
                    <motion.p
                      className={cn(
                        "transition-all duration-200",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                      animate={{ 
                        textDecoration: todo.completed ? "line-through" : "none" 
                      }}
                    >
                      {todo.text}
                    </motion.p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          priorityColors[todo.priority],
                          "dark:" + priorityColorsDark[todo.priority]
                        )}
                      >
                        {todo.priority === "high" && <Star className="h-3 w-3 mr-1" />}
                        {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {todo.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No todos yet</h3>
              <p className="text-muted-foreground">
                Add your first todo to get started!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}