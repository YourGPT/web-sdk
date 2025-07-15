"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Clock, Target, Zap } from "lucide-react";
import { Todo, Priority, PRIORITY_CONFIG } from "@/types/todo";
import { cn } from "@/lib/utils";

interface CreateTodoFormProps {
  onCreateTodo: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => void;
  className?: string;
}

export function CreateTodoForm({ onCreateTodo, className }: CreateTodoFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    // Simulate API call delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    onCreateTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: "todo",
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={className}>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" size="lg">
            <Plus className="h-5 w-5" />
            Create Task
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-blue-600" />
            Create New Task
          </DialogTitle>
          <DialogDescription>Add a new task to your workflow.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title *
            </Label>
            <Input id="title" placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} className="text-base" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea id="description" placeholder="Add more details about this task..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="resize-none" />
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Priority
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <Card key={key} className={cn("cursor-pointer transition-all duration-200 hover:shadow-md", priority === key ? "ring-2 ring-blue-500 shadow-md" : "hover:bg-muted/50")} onClick={() => setPriority(key as Priority)}>
                  <CardContent className="p-3 text-center">
                    <div className="text-lg mb-1">{config.icon}</div>
                    <div className="text-sm font-medium">{config.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {isSubmitting ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Clock className="h-4 w-4" />
                  </motion.div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
