"use client";

import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Calendar, 
  Tag, 
  Trash2,
  Edit3,
  Clock,
  AlertTriangle,
  GripVertical
} from "lucide-react";
import { Todo, PRIORITY_CONFIG } from "@/types/todo";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: string) => void;
  isActive?: boolean;
  isDragging?: boolean;
}

export function KanbanCard({ 
  todo, 
  onDelete, 
  isActive = false,
  isDragging = false
}: KanbanCardProps) {
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[todo.priority];
  const isOverdue = todo.dueDate && new Date() > todo.dueDate;

  const handleDelete = () => {
    onDelete(todo.id);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days > 0) return `${days} days`;
    if (days === -1) return "Yesterday";
    return `${Math.abs(days)} days ago`;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      layout
      className={cn(
        "group relative",
        (isActive || isSortableDragging) && "z-50",
        isDragging && "shadow-2xl"
      )}
    >
      <Card className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md border-l-4",
        priorityConfig.color.includes("red") && "border-l-red-500",
        priorityConfig.color.includes("yellow") && "border-l-yellow-500",
        priorityConfig.color.includes("green") && "border-l-green-500",
        (isActive || isSortableDragging) && "shadow-lg ring-2 ring-blue-500/50",
        isDragging && "shadow-2xl rotate-2"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                {todo.title}
              </h3>
              {todo.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {todo.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Drag Handle */}
              <motion.div
                {...listeners}
                className={cn(
                  "p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing",
                  "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              </motion.div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 w-6 p-0 hover:bg-muted",
                      "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Priority Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs px-2 py-0.5",
                priorityConfig.color,
                "dark:" + priorityConfig.darkColor
              )}
            >
              <span className="mr-1">{priorityConfig.icon}</span>
              {priorityConfig.label}
            </Badge>
            
            {isOverdue && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </motion.div>
            )}
          </div>

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {todo.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {todo.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{todo.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {/* Assignee */}
              {todo.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(todo.assignee)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {/* Due Date */}
              {todo.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-red-500" : "text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>{formatRelativeTime(todo.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Created Time */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(todo.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}