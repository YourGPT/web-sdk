"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock, CheckCircle2, Circle } from "lucide-react";
import { Todo, Status, COLUMNS } from "@/types/todo";
import { KanbanCard } from "./kanban-card";
import { CreateTodoForm } from "./create-todo-form";
import { cn } from "@/lib/utils";

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  isActive: boolean;
}

function DroppableColumn({ id, children, isActive }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[400px] p-4 space-y-3 transition-all duration-200",
        "border-2 border-dashed rounded-lg",
        isOver || isActive ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20" : "border-transparent hover:border-muted-foreground/20"
      )}
    >
      {children}
    </div>
  );
}

interface KanbanBoardProps {
  todos: Todo[];
  onUpdateTodo: (todo: Todo) => void;
  onCreateTodo: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteTodo: (id: string) => void;
}

export function KanbanBoard({ todos, onUpdateTodo, onCreateTodo, onDeleteTodo }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const todosByColumn = useMemo(() => {
    const grouped = COLUMNS.reduce((acc, column) => {
      acc[column.id] = todos.filter((todo) => todo.status === column.id);
      return acc;
    }, {} as Record<Status, Todo[]>);
    return grouped;
  }, [todos]);

  const handleDragStart = (event: DragStartEvent) => {
    const todo = todos.find((t) => t.id === event.active.id);
    if (todo) {
      setActiveId(event.active.id as string);
      setDraggedTodo(todo);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDraggedTodo(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTodo = todos.find((t) => t.id === activeId);
    if (!activeTodo) return;

    // Check if we're dropping on a column
    const targetColumn = COLUMNS.find((col) => col.id === overId);
    if (targetColumn && activeTodo.status !== targetColumn.id) {
      const updatedTodo = {
        ...activeTodo,
        status: targetColumn.id,
        updatedAt: new Date(),
      };
      onUpdateTodo(updatedTodo);
    }

    // Handle reordering within the same column
    if (activeId !== overId) {
      const activeColumn = activeTodo.status;
      const overTodo = todos.find((t) => t.id === overId);

      if (overTodo && overTodo.status === activeColumn) {
        const columnTodos = todosByColumn[activeColumn];
        const activeIndex = columnTodos.findIndex((t) => t.id === activeId);
        const overIndex = columnTodos.findIndex((t) => t.id === overId);

        if (activeIndex !== overIndex) {
          const reorderedTodos = arrayMove(columnTodos, activeIndex, overIndex);
          // In a real app, you'd update the order in your backend
          console.log("Reordered todos:", reorderedTodos);
        }
      }
    }

    setActiveId(null);
    setDraggedTodo(null);
  };

  const handleCreateTodo = (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onCreateTodo(newTodo);
  };

  const getColumnIcon = (status: Status) => {
    switch (status) {
      case "todo":
        return <Circle className="h-4 w-4 text-slate-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getColumnStats = (columnId: Status) => {
    const columnTodos = todosByColumn[columnId];
    const total = columnTodos.length;
    const highPriority = columnTodos.filter((t) => t.priority === "high").length;
    return { total, highPriority };
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Board</h1>
          <p className="text-muted-foreground">Drag and drop tasks to update their status</p>
        </div>
        <CreateTodoForm onCreateTodo={handleCreateTodo} />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {COLUMNS.map((column) => {
          const stats = getColumnStats(column.id);
          return (
            <div key={column.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getColumnIcon(column.id)}
                  <span className="font-medium">{column.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats.total}</Badge>
                  {stats.highPriority > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stats.highPriority} high
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {COLUMNS.map((column) => (
            <motion.div key={column.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * COLUMNS.indexOf(column) }} className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getColumnIcon(column.id)}
                      <span>{column.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {todosByColumn[column.id].length}
                        {column.limit && `/${column.limit}`}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{column.description}</p>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <SortableContext items={todosByColumn[column.id].map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
                    <DroppableColumn id={column.id} isActive={!!activeId}>
                      <AnimatePresence mode="popLayout">
                        {todosByColumn[column.id].map((todo) => (
                          <KanbanCard key={todo.id} todo={todo} onUpdate={onUpdateTodo} onDelete={onDeleteTodo} isActive={activeId === todo.id} />
                        ))}
                      </AnimatePresence>

                      {todosByColumn[column.id].length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                            className="text-4xl mb-2 opacity-20"
                          >
                            {getColumnIcon(column.id)}
                          </motion.div>
                          <p className="text-sm text-muted-foreground">No tasks in {column.title.toLowerCase()}</p>
                          <p className="text-xs text-muted-foreground mt-1 opacity-60">Drag tasks here to update status</p>
                        </motion.div>
                      )}
                    </DroppableColumn>
                  </SortableContext>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedTodo && (
            <motion.div initial={{ scale: 1 }} animate={{ scale: 1.05 }} className="transform rotate-2">
              <KanbanCard todo={draggedTodo} onUpdate={onUpdateTodo} onDelete={onDeleteTodo} isActive={true} isDragging={true} />
            </motion.div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
