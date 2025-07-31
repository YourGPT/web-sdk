"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  useDroppable,
  rectIntersection
} from "@dnd-kit/core";
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
  isOverDropZone: boolean;
}

function DroppableColumn({ id, children, isActive, isOverDropZone }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-h-[200px] transition-all duration-200",
        (isOver || isActive || isOverDropZone) && "bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800"
      )}
    >
      {children}
    </div>
  );
}

// Add a droppable area that covers the entire column
interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
}

function DroppableArea({ id, children }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${id}-drop-area`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] flex-1 transition-all duration-200",
        isOver && "bg-blue-50/30 dark:bg-blue-950/10 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg"
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
  const [overId, setOverId] = useState<string | null>(null);

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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setDraggedTodo(null);
    setOverId(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTodo = todos.find((t) => t.id === activeId);
    if (!activeTodo) return;

    // Determine the target column from the overId
    let targetColumnId: Status | null = null;

    // Check if dropping directly on a column
    if (COLUMNS.some(col => col.id === overId)) {
      targetColumnId = overId as Status;
    }
    // Check if dropping on a column drop area
    else if (overId.endsWith('-drop-area')) {
      const columnId = overId.replace('-drop-area', '');
      if (COLUMNS.some(col => col.id === columnId)) {
        targetColumnId = columnId as Status;
      }
    }
    // Check if dropping on another todo
    else {
      const overTodo = todos.find((t) => t.id === overId);
      if (overTodo) {
        targetColumnId = overTodo.status;
      }
    }

    if (!targetColumnId) return;

    // If moving to a different column, update the todo's status
    if (activeTodo.status !== targetColumnId) {
      const updatedTodo = {
        ...activeTodo,
        status: targetColumnId,
        updatedAt: new Date(),
      };
      onUpdateTodo(updatedTodo);
    }
    // If reordering within the same column
    else if (activeId !== overId) {
      const overTodo = todos.find((t) => t.id === overId);
      if (overTodo && overTodo.status === activeTodo.status) {
        const columnTodos = todosByColumn[activeTodo.status];
        const activeIndex = columnTodos.findIndex((t) => t.id === activeId);
        const overIndex = columnTodos.findIndex((t) => t.id === overId);

        if (activeIndex !== overIndex) {
          const reorderedTodos = arrayMove(columnTodos, activeIndex, overIndex);
          // In a real app, you'd update the order in your backend
          console.log("Reordered todos in column:", activeTodo.status, reorderedTodos.map(t => t.title));
        }
      }
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {COLUMNS.map((column) => {
            const isOverColumn = overId === column.id || overId === `${column.id}-drop-area`;
            const columnTodos = todosByColumn[column.id];

            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * COLUMNS.indexOf(column) }}
                className="flex flex-col"
              >
                <SortableContext items={columnTodos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
                  <DroppableColumn
                    id={column.id}
                    isActive={!!activeId}
                    isOverDropZone={isOverColumn}
                  >
                    <Card className="flex-1 flex flex-col h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {getColumnIcon(column.id)}
                            <span>{column.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {columnTodos.length}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{column.description}</p>
                      </CardHeader>

                      <CardContent className="flex-1 p-4">
                        <DroppableArea id={column.id}>
                          <div className="space-y-3 min-h-[100px]">
                            <AnimatePresence mode="popLayout">
                              {columnTodos.map((todo) => (
                                <KanbanCard
                                  key={todo.id}
                                  todo={todo}
                                  onUpdate={onUpdateTodo}
                                  onDelete={onDeleteTodo}
                                  isActive={activeId === todo.id}
                                />
                              ))}
                            </AnimatePresence>

                            {columnTodos.length === 0 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                              >
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
                                <p className="text-xs text-muted-foreground mt-1 opacity-60">
                                  Drop tasks anywhere in this column
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </DroppableArea>
                      </CardContent>
                    </Card>
                  </DroppableColumn>
                </SortableContext>
              </motion.div>
            );
          })}
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
