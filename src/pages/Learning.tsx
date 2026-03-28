import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, X, BookOpen, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LearningTask {
  id: string;
  title: string;
  completed: boolean;
  notes: string;
  expanded: boolean;
}

const initialTasks: LearningTask[] = [
  { id: "1", title: "Review API rate-limiting strategy document", completed: false, notes: "", expanded: false },
  { id: "2", title: "Complete auth flow integration testing", completed: false, notes: "", expanded: false },
  { id: "3", title: "Read Sentinel agent security audit report", completed: false, notes: "", expanded: false },
  { id: "4", title: "Study webhook v2 schema migration notes", completed: false, notes: "", expanded: false },
  { id: "5", title: "Practice cron job scheduling patterns", completed: false, notes: "", expanded: false },
];

export default function Learning() {
  const [tasks, setTasks] = useState<LearningTask[]>(initialTasks);
  const [newTask, setNewTask] = useState("");

  const toggle = (id: string) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)));

  const updateNotes = (id: string, notes: string) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, notes } : x)));

  const toggleExpand = (id: string) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, expanded: !x.expanded } : x)));

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((t) => [
      ...t,
      { id: `t-${Date.now()}`, title: newTask.trim(), completed: false, notes: "", expanded: false },
    ]);
    setNewTask("");
  };

  const removeTask = (id: string) => setTasks((t) => t.filter((x) => x.id !== id));

  const done = tasks.filter((t) => t.completed).length;

  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learning</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Today's tasks · {done}/{tasks.length} complete
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">Progress</span>
          <span className="text-xs font-mono text-primary">{tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: tasks.length > 0 ? `${(done / tasks.length) * 100}%` : "0%" }}
            transition={{ type: "spring", stiffness: 120 }}
          />
        </div>
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new learning task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className="bg-card border-border font-mono text-sm"
        />
        <Button onClick={addTask} size="sm" className="gap-1.5 font-mono text-xs shrink-0" disabled={!newTask.trim()}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-lg border border-border bg-card overflow-hidden group"
            >
              {/* Main row */}
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => toggle(task.id)} className="shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>

                <span
                  className={cn(
                    "flex-1 text-sm font-mono transition-all",
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  )}
                >
                  {task.title}
                </span>

                {task.notes && !task.expanded && (
                  <Pencil className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                )}

                <button onClick={() => toggleExpand(task.id)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  {task.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <button onClick={() => removeTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Notes area */}
              <AnimatePresence>
                {task.expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-12">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1.5 block">
                        What I learned
                      </label>
                      <Textarea
                        value={task.notes}
                        onChange={(e) => updateNotes(task.id, e.target.value)}
                        placeholder="Write your notes and takeaways here..."
                        className="bg-background border-border resize-none font-mono text-xs"
                        rows={3}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tasks yet. Add one above to get started.</p>
        </div>
      )}
    </div>
  );
}
