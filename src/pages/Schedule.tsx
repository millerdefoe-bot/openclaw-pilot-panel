import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCw,
  Bot,
  User,
  X,
  CalendarIcon,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export type ScheduleType = "one-time" | "daily" | "weekly" | "monthly" | "cron";
export type ScheduleAssignee = "user" | "openclaw";

export interface ScheduledTask {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  type: ScheduleType;
  cronExpression?: string;
  assignee: ScheduleAssignee;
  active: boolean;
}

const typeConfig: Record<ScheduleType, { label: string; icon: typeof Clock }> = {
  "one-time": { label: "One-time", icon: CalendarIcon },
  daily: { label: "Daily", icon: RotateCw },
  weekly: { label: "Weekly", icon: RotateCw },
  monthly: { label: "Monthly", icon: RotateCw },
  cron: { label: "Cron", icon: Clock },
};

// Global store for adding tasks from outside
let globalSetScheduledTasks: React.Dispatch<React.SetStateAction<ScheduledTask[]>> | null = null;

export function addScheduledTask(task: Omit<ScheduledTask, "id">) {
  if (globalSetScheduledTasks) {
    globalSetScheduledTasks((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID() },
    ]);
  }
}

const defaultTasks: ScheduledTask[] = [
  {
    id: "1",
    title: "Health check ping",
    description: "Ping all monitored endpoints and report status",
    date: new Date(),
    time: "*/5 * * * *",
    type: "cron",
    cronExpression: "*/5 * * * *",
    assignee: "openclaw",
    active: true,
  },
  {
    id: "2",
    title: "Daily usage report",
    description: "Compile and post daily command usage statistics to #reports",
    date: new Date(),
    time: "09:00",
    type: "daily",
    assignee: "openclaw",
    active: true,
  },
  {
    id: "3",
    title: "Weekly backup",
    description: "Full database backup and config snapshot",
    date: new Date(new Date().setDate(new Date().getDate() + ((7 - new Date().getDay()) % 7 || 7))),
    time: "02:00",
    type: "weekly",
    assignee: "openclaw",
    active: true,
  },
  {
    id: "4",
    title: "Review security logs",
    description: "Manual review of flagged security events",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    time: "14:00",
    type: "one-time",
    assignee: "user",
    active: true,
  },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Schedule() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(defaultTasks);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [newTime, setNewTime] = useState("12:00");
  const [newType, setNewType] = useState<ScheduleType>("one-time");
  const [newCron, setNewCron] = useState("");
  const [newAssignee, setNewAssignee] = useState<ScheduleAssignee>("openclaw");

  globalSetScheduledTasks = setTasks;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => t.active && isSameDay(t.date, day));

  const selectedDayTasks = selectedDay
    ? tasks.filter((t) => isSameDay(t.date, selectedDay))
    : [];

  // Recurring tasks (shown in sidebar list)
  const recurringTasks = tasks.filter((t) => t.type !== "one-time");

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        date: newDate,
        time: newTime,
        type: newType,
        cronExpression: newType === "cron" ? newCron : undefined,
        assignee: newAssignee,
        active: true,
      },
    ]);
    setNewTitle("");
    setNewDesc("");
    setNewDate(new Date());
    setNewTime("12:00");
    setNewType("one-time");
    setNewCron("");
    setNewAssignee("openclaw");
    setDialogOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Scheduled tasks & cron jobs · {tasks.filter((t) => t.active).length} active
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 glow-primary">
              <Plus className="h-4 w-4" />
              Schedule Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Schedule a Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-secondary border-border"
              />
              <Textarea
                placeholder="Description (optional)..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="bg-secondary border-border min-h-[60px]"
              />
              <div className="flex gap-3">
                <Select value={newType} onValueChange={(v) => setNewType(v as ScheduleType)}>
                  <SelectTrigger className="bg-secondary border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="cron">Cron</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newAssignee} onValueChange={(v) => setNewAssignee(v as ScheduleAssignee)}>
                  <SelectTrigger className="bg-secondary border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <span className="flex items-center gap-2"><User className="h-3 w-3" /> Me</span>
                    </SelectItem>
                    <SelectItem value="openclaw">
                      <span className="flex items-center gap-2"><Bot className="h-3 w-3" /> OpenClaw</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newType === "cron" ? (
                <Input
                  placeholder="Cron expression (e.g. */5 * * * *)"
                  value={newCron}
                  onChange={(e) => setNewCron(e.target.value)}
                  className="bg-secondary border-border font-mono text-xs"
                />
              ) : (
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-secondary border-border",
                          !newDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDate ? format(newDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newDate}
                        onSelect={setNewDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="bg-secondary border-border w-32"
                  />
                </div>
              )}
              <Button onClick={handleAdd} className="w-full glow-primary">
                Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-3 rounded-lg border border-border bg-card p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-mono text-foreground tracking-wide">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative h-20 border border-border/30 p-1 text-left transition-colors",
                    !isCurrentMonth && "opacity-30",
                    isSelected && "bg-primary/10 border-primary/40",
                    isToday && !isSelected && "bg-secondary",
                    "hover:bg-secondary/80"
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] font-mono",
                      isToday ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-0.5 space-y-0.5 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "text-[9px] font-mono truncate rounded px-1 py-0.5",
                          t.assignee === "openclaw"
                            ? "bg-primary/20 text-primary"
                            : "bg-info/20 text-info"
                        )}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-muted-foreground font-mono">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Selected day details */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-3">
              {selectedDay ? format(selectedDay, "EEEE, MMM d") : "Select a day"}
            </h3>
            <AnimatePresence mode="popLayout">
              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 font-mono text-center py-4">
                  No tasks scheduled
                </p>
              ) : (
                selectedDayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border-l-2 border-l-primary pl-3 py-2 mb-2 group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm text-foreground leading-snug">{task.title}</p>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {task.assignee === "openclaw" ? (
                        <Bot className="h-3 w-3 text-primary" />
                      ) : (
                        <User className="h-3 w-3 text-info" />
                      )}
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {task.assignee === "user" ? "You" : "OpenClaw"}
                      </span>
                      <Badge variant="secondary" className="text-[9px] font-mono ml-auto">
                        {typeConfig[task.type].label}
                      </Badge>
                    </div>
                    {task.time && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground">{task.time}</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Recurring tasks */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-3">
              Recurring Jobs
            </h3>
            <div className="space-y-2">
              {recurringTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
                    task.active ? "bg-secondary/50" : "bg-secondary/20 opacity-50"
                  )}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0 transition-colors",
                      task.active ? "bg-success animate-pulse-glow" : "bg-muted-foreground"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground truncate">{task.title}</p>
                    <p className="text-[9px] font-mono text-muted-foreground">
                      {task.cronExpression || typeConfig[task.type].label}
                    </p>
                  </div>
                </div>
              ))}
              {recurringTasks.length === 0 && (
                <p className="text-xs text-muted-foreground/40 font-mono text-center py-3">No recurring jobs</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
