import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, User, Bot, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskAssignee = "user" | "openclaw";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: TaskAssignee;
  createdAt: string;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "text-muted-foreground", bg: "bg-muted" },
  "in-progress": { label: "In Progress", color: "text-warning", bg: "bg-warning/10" },
  done: { label: "Done", color: "text-success", bg: "bg-success/10" },
};

const columns: TaskStatus[] = ["todo", "in-progress", "done"];

// Global task store so it can be updated from outside
let globalSetTasks: React.Dispatch<React.SetStateAction<Task[]>> | null = null;

export function addTask(task: Omit<Task, "id" | "createdAt">) {
  if (globalSetTasks) {
    globalSetTasks((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  }
}

export function updateTaskStatus(taskId: string, status: TaskStatus) {
  if (globalSetTasks) {
    globalSetTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  }
}

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Build task board on Activity page",
    status: "done",
    assignee: "openclaw",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Connect agent chat to real AI backend",
    status: "todo",
    assignee: "user",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Add real-time bot telemetry data",
    status: "todo",
    assignee: "user",
    createdAt: new Date().toISOString(),
  },
];

export default function Activity() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<TaskAssignee>("user");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Register global setter
  globalSetTasks = setTasks;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        status: newStatus,
        assignee: newAssignee,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewTitle("");
    setNewAssignee("user");
    setNewStatus("todo");
    setDialogOpen(false);
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Track all tasks · {tasks.length} total
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-primary">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="bg-secondary border-border"
              />
              <div className="flex gap-3">
                <Select value={newAssignee} onValueChange={(v) => setNewAssignee(v as TaskAssignee)}>
                  <SelectTrigger className="bg-secondary border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <span className="flex items-center gap-2">
                        <User className="h-3 w-3" /> Me
                      </span>
                    </SelectItem>
                    <SelectItem value="openclaw">
                      <span className="flex items-center gap-2">
                        <Bot className="h-3 w-3" /> OpenClaw
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
                  <SelectTrigger className="bg-secondary border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {statusConfig[col].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full glow-primary">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          const config = statusConfig[col];
          return (
            <div
              key={col}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${col === "todo" ? "bg-muted-foreground" : col === "in-progress" ? "bg-warning animate-pulse-glow" : "bg-success"}`} />
                  <h3 className={`text-xs uppercase tracking-widest font-mono ${config.color}`}>
                    {config.label}
                  </h3>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {colTasks.length}
                </Badge>
              </div>

              <AnimatePresence>
                {colTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-md border border-border bg-secondary/50 p-3 space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground leading-snug">
                        {task.title}
                      </p>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {task.assignee === "user" ? (
                          <User className="h-3 w-3 text-info" />
                        ) : (
                          <Bot className="h-3 w-3 text-primary" />
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {task.assignee === "user" ? "You" : "OpenClaw"}
                        </span>
                      </div>
                      <Select
                        value={task.status}
                        onValueChange={(v) => moveTask(task.id, v as TaskStatus)}
                      >
                        <SelectTrigger className="h-6 w-auto gap-1 border-none bg-transparent text-[10px] font-mono text-muted-foreground p-0 px-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusConfig[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <p className="text-xs text-muted-foreground/40 font-mono text-center py-6">
                  No tasks
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
