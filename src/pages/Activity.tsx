import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, User, Bot, Calendar, Flag, Filter,
  ChevronDown, MessageSquare, Clock,
  AlertTriangle, ArrowUp, ArrowRight, ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// --- Types ---
export type TaskStatus = "backlog" | "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskAssignee = { type: "user"; name: string } | { type: "agent"; name: string };
export type ProjectType = "Infrastructure" | "Features" | "Research";

export interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: TaskAssignee;
  dueDate?: Date;
  project: ProjectType;
  comments: Comment[];
  createdAt: string;
}

// --- Config ---
const columns: { key: TaskStatus; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: typeof ArrowUp }> = {
  urgent: { label: "Urgent", color: "text-destructive", icon: AlertTriangle },
  high: { label: "High", color: "text-warning", icon: ArrowUp },
  medium: { label: "Medium", color: "text-info", icon: ArrowRight },
  low: { label: "Low", color: "text-muted-foreground", icon: ArrowDown },
};

const projectColors: Record<ProjectType, string> = {
  Infrastructure: "bg-primary/20 text-primary",
  Features: "bg-success/20 text-success",
  Research: "bg-info/20 text-info",
};

const projects: ProjectType[] = ["Infrastructure", "Features", "Research"];

// --- Default data ---
const defaultTasks: Task[] = [
  {
    id: "1", title: "Build Kanban task board", description: "Full drag-and-drop board with filters, priorities, due dates, and expandable cards.",
    status: "done", priority: "high", assignee: { type: "agent", name: "OpenClaw" },
    project: "Features", comments: [], createdAt: new Date().toISOString(),
  },
  {
    id: "2", title: "Connect bot telemetry to live data", description: "Replace mock dashboard data with real WebSocket feeds.",
    status: "todo", priority: "medium", assignee: { type: "user", name: "Me" },
    project: "Infrastructure", comments: [], createdAt: new Date().toISOString(),
  },
  {
    id: "3", title: "Research AI model options", description: "Compare GPT-4o, Claude, and Gemini for agent chat backend.",
    status: "backlog", priority: "low", assignee: { type: "user", name: "Me" },
    project: "Research", comments: [], createdAt: new Date().toISOString(),
  },
  {
    id: "4", title: "Implement persistent storage", description: "Add localStorage or DB persistence for tasks and schedule.",
    status: "in-progress", priority: "high", assignee: { type: "agent", name: "Forge" },
    project: "Infrastructure", comments: [], createdAt: new Date().toISOString(),
  },
  {
    id: "5", title: "Add team chat functionality", description: "Enable real-time messaging between user and agents.",
    status: "todo", priority: "medium", assignee: { type: "agent", name: "Relay" },
    dueDate: new Date(Date.now() + 7 * 86400000),
    project: "Features", comments: [{ id: "c1", author: "OpenClaw", text: "Relay agent is on standby for this.", time: "2h ago" }],
    createdAt: new Date().toISOString(),
  },
];

// --- Component ---
export default function Activity() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedTask, setExpandedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  // Filters
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");

  // New task form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newAssigneeType, setNewAssigneeType] = useState<"user" | "agent">("user");
  const [newAgentName, setNewAgentName] = useState("OpenClaw");
  const [newDueDate, setNewDueDate] = useState<Date | undefined>();
  const [newProject, setNewProject] = useState<ProjectType>("Features");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");

  const filteredTasks = tasks.filter((t) => {
    if (filterAssignee !== "all") {
      if (filterAssignee === "me" && (t.assignee.type !== "user" || t.assignee.name !== "Me")) return false;
      if (filterAssignee === "agents" && t.assignee.type !== "agent") return false;
    }
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterProject !== "all" && t.project !== filterProject) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const assignee: TaskAssignee = newAssigneeType === "user"
      ? { type: "user", name: "Me" }
      : { type: "agent", name: newAgentName };
    setTasks((prev) => [...prev, {
      id: crypto.randomUUID(), title: newTitle.trim(), description: newDesc.trim() || undefined,
      status: newStatus, priority: newPriority, assignee, dueDate: newDueDate,
      project: newProject, comments: [], createdAt: new Date().toISOString(),
    }]);
    setNewTitle(""); setNewDesc(""); setNewPriority("medium"); setNewAssigneeType("user");
    setNewAgentName("OpenClaw"); setNewDueDate(undefined); setNewProject("Features"); setNewStatus("todo");
    setDialogOpen(false);
  };

  const handleDragStart = (taskId: string) => setDraggedTaskId(taskId);
  const handleDragEnd = () => setDraggedTaskId(null);
  const handleDrop = (status: TaskStatus) => {
    if (!draggedTaskId) return;
    setTasks((prev) => prev.map((t) => t.id === draggedTaskId ? { ...t, status } : t));
    setDraggedTaskId(null);
  };

  const addComment = () => {
    if (!newComment.trim() || !expandedTask) return;
    setTasks((prev) => prev.map((t) =>
      t.id === expandedTask.id
        ? { ...t, comments: [...t.comments, { id: crypto.randomUUID(), author: "Me", text: newComment.trim(), time: "Just now" }] }
        : t
    ));
    setExpandedTask((prev) => prev ? {
      ...prev,
      comments: [...prev.comments, { id: crypto.randomUUID(), author: "Me", text: newComment.trim(), time: "Just now" }],
    } : null);
    setNewComment("");
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (expandedTask?.id === id) setExpandedTask(null);
  };

  // Unique assignees for filter
  const assigneeNames = [...new Set(tasks.filter((t) => t.assignee.type === "agent").map((t) => t.assignee.name))];

  return (
    <div className="p-6 space-y-5 bg-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
          <p className="text-sm text-muted-foreground font-mono">
            {tasks.length} tasks · {tasks.filter((t) => t.status === "done").length} completed
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-primary"><Plus className="h-4 w-4" />New Task</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-foreground">Create Task</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Task title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-secondary border-border" />
              <Textarea placeholder="Description (optional)..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-secondary border-border min-h-[60px]" />
              <div className="grid grid-cols-2 gap-3">
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as TaskPriority)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["urgent", "high", "medium", "low"] as TaskPriority[]).map((p) => (
                      <SelectItem key={p} value={p}><span className="flex items-center gap-2">{React.createElement(priorityConfig[p].icon, { className: `h-3 w-3 ${priorityConfig[p].color}` })}{priorityConfig[p].label}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newProject} onValueChange={(v) => setNewProject(v as ProjectType)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={newAssigneeType} onValueChange={(v) => setNewAssigneeType(v as "user" | "agent")}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user"><span className="flex items-center gap-2"><User className="h-3 w-3" />Me</span></SelectItem>
                    <SelectItem value="agent"><span className="flex items-center gap-2"><Bot className="h-3 w-3" />Agent</span></SelectItem>
                  </SelectContent>
                </Select>
                {newAssigneeType === "agent" ? (
                  <Select value={newAgentName} onValueChange={setNewAgentName}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["OpenClaw", "Sentinel", "Tutor", "Forge", "Scout", "Gears", "Relay"].map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {newAssigneeType === "agent" && (
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start bg-secondary border-border", !newDueDate && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {newDueDate ? format(newDueDate, "PPP") : "Due date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker mode="single" selected={newDueDate} onSelect={setNewDueDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Button onClick={handleAdd} className="w-full glow-primary">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            <SelectItem value="me">Me</SelectItem>
            <SelectItem value="agents">Agents</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(["urgent", "high", "medium", "low"] as TaskPriority[]).map((p) => (
              <SelectItem key={p} value={p}>{priorityConfig[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-36 h-8 text-xs bg-secondary border-border"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-1", "ring-primary/40"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("ring-1", "ring-primary/40"); }}
              onDrop={(e) => { e.currentTarget.classList.remove("ring-1", "ring-primary/40"); handleDrop(col.key); }}
              className="rounded-lg border border-border bg-card p-3 space-y-2 min-h-[200px] transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", col.key === "backlog" ? "bg-muted-foreground" : col.key === "todo" ? "bg-info" : col.key === "in-progress" ? "bg-warning animate-pulse-glow" : "bg-success")} />
                  <h3 className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">{col.label}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">{colTasks.length}</Badge>
              </div>

              <AnimatePresence>
                {colTasks.map((task) => {
                  const PriorityIcon = priorityConfig[task.priority].icon;
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setExpandedTask(task)}
                      className={cn(
                        "rounded-md border border-border bg-secondary/50 p-3 space-y-2 group cursor-pointer hover:border-primary/30 transition-colors",
                        draggedTaskId === task.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground leading-snug font-medium">{task.title}</p>
                        <button onClick={(e) => { e.stopPropagation(); removeTask(task.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn("text-[9px] font-mono px-1.5 py-0", projectColors[task.project])}>{task.project}</Badge>
                        <div className={cn("flex items-center gap-1", priorityConfig[task.priority].color)}>
                          <PriorityIcon className="h-3 w-3" />
                          <span className="text-[9px] font-mono">{priorityConfig[task.priority].label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {task.assignee.type === "user" ? <User className="h-3 w-3 text-info" /> : <Bot className="h-3 w-3 text-primary" />}
                          <span className="text-[10px] font-mono text-muted-foreground">{task.assignee.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.comments.length > 0 && (
                            <div className="flex items-center gap-0.5 text-muted-foreground">
                              <MessageSquare className="h-2.5 w-2.5" />
                              <span className="text-[9px] font-mono">{task.comments.length}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-0.5 text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />
                              <span className="text-[9px] font-mono">{format(task.dueDate, "MMM d")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <p className="text-xs text-muted-foreground/30 font-mono text-center py-8">Drop tasks here</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded task detail dialog */}
      <Dialog open={!!expandedTask} onOpenChange={(open) => { if (!open) setExpandedTask(null); }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
          {expandedTask && (() => {
            const PIcon = priorityConfig[expandedTask.priority].icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground text-lg">{expandedTask.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  {/* Meta */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={cn("text-[10px] font-mono", projectColors[expandedTask.project])}>{expandedTask.project}</Badge>
                    <div className={cn("flex items-center gap-1", priorityConfig[expandedTask.priority].color)}>
                      <PIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-mono">{priorityConfig[expandedTask.priority].label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {expandedTask.assignee.type === "user" ? <User className="h-3.5 w-3.5 text-info" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
                      <span className="text-xs font-mono text-muted-foreground">{expandedTask.assignee.name}</span>
                    </div>
                    {expandedTask.dueDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-mono">{format(expandedTask.dueDate, "PPP")}</span>
                      </div>
                    )}
                  </div>

                  {/* Status change */}
                  <Select
                    value={expandedTask.status}
                    onValueChange={(v) => {
                      const newStatus = v as TaskStatus;
                      setTasks((prev) => prev.map((t) => t.id === expandedTask.id ? { ...t, status: newStatus } : t));
                      setExpandedTask((prev) => prev ? { ...prev, status: newStatus } : null);
                    }}
                  >
                    <SelectTrigger className="bg-secondary border-border w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  {/* Description */}
                  {expandedTask.description && (
                    <div className="rounded-md bg-secondary/50 p-3">
                      <p className="text-sm text-foreground/80 leading-relaxed">{expandedTask.description}</p>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
                      Comments ({expandedTask.comments.length})
                    </h4>
                    <div className="space-y-2 mb-3">
                      {expandedTask.comments.map((c) => (
                        <div key={c.id} className="border-l-2 border-l-primary/30 pl-3 py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-foreground">{c.author}</span>
                            <span className="text-[9px] font-mono text-muted-foreground">{c.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.text}</p>
                        </div>
                      ))}
                      {expandedTask.comments.length === 0 && (
                        <p className="text-xs text-muted-foreground/40 font-mono">No comments yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addComment()}
                        className="bg-secondary border-border text-xs"
                      />
                      <Button size="sm" onClick={addComment} className="shrink-0">Post</Button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
