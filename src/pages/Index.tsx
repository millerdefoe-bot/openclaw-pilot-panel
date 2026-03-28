import { motion } from "framer-motion";
import {
  CheckCircle2, CalendarClock, Bot, Activity,
  Zap, Shield, BookOpen, Wrench, Search, Radio, Clock,
} from "lucide-react";

// --- Metric Cards ---
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  accentClass?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, accentClass = "text-primary" }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-5 glow-primary"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 font-mono">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className={`h-5 w-5 ${accentClass}`} />
        </div>
      </div>
    </motion.div>
  );
}

// --- Status dot ---
type StatusType = "active" | "pending" | "error" | "idle";

const statusConfig: Record<StatusType, { dot: string; label: string }> = {
  active: { dot: "bg-success", label: "Active" },
  pending: { dot: "bg-warning", label: "Pending" },
  error: { dot: "bg-destructive", label: "Error" },
  idle: { dot: "bg-muted-foreground/50", label: "Idle" },
};

function StatusDot({ status }: { status: StatusType }) {
  const { dot, label } = statusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot} ${status === "active" ? "animate-pulse-glow" : ""}`} />
      <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
    </span>
  );
}

// --- Activity data ---
interface ActivityEntry {
  id: string;
  agent: string;
  agentIcon: React.ElementType;
  action: string;
  detail: string;
  timestamp: string;
  status: StatusType;
}

const agentActivity: ActivityEntry[] = [
  { id: "1", agent: "Sentinel", agentIcon: Shield, action: "Security scan completed", detail: "Scanned 42 endpoints — 0 threats detected", timestamp: "Just now", status: "active" },
  { id: "2", agent: "OpenClaw", agentIcon: Bot, action: "Task board updated", detail: "Moved 'API Integration' to in-progress", timestamp: "2m ago", status: "active" },
  { id: "3", agent: "Tutor", agentIcon: BookOpen, action: "Training module generated", detail: "Created onboarding guide v2.1", timestamp: "8m ago", status: "active" },
  { id: "4", agent: "Forge", agentIcon: Wrench, action: "Build pipeline triggered", detail: "Deploying feature/auth-flow branch", timestamp: "15m ago", status: "pending" },
  { id: "5", agent: "Scout", agentIcon: Search, action: "Data scrape queued", detail: "Waiting for rate-limit window", timestamp: "22m ago", status: "pending" },
  { id: "6", agent: "Relay", agentIcon: Radio, action: "Webhook delivery failed", detail: "Timeout on endpoint /hooks/deploy — retrying", timestamp: "31m ago", status: "error" },
  { id: "7", agent: "Gears", agentIcon: Wrench, action: "Cron job executed", detail: "Daily DB backup completed successfully", timestamp: "1h ago", status: "active" },
  { id: "8", agent: "Sentinel", agentIcon: Shield, action: "Firewall rule updated", detail: "Blocked 3 suspicious IPs", timestamp: "2h ago", status: "active" },
  { id: "9", agent: "Scout", agentIcon: Search, action: "Idle — no pending tasks", detail: "Awaiting next assignment", timestamp: "3h ago", status: "idle" },
];

const Dashboard = () => {
  const activeTasks = 7;
  const upcomingEvents = 4;
  const agentActions24h = 38;

  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground font-mono">Mission Control Overview</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs font-mono text-muted-foreground">OpenClaw Online</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">v2.4.1</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Active Tasks"
          value={activeTasks}
          subtitle="Across all projects"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Upcoming Events"
          value={upcomingEvents}
          subtitle="Next 48 hours"
          icon={CalendarClock}
        />
        <MetricCard
          title="Agent Activity"
          value={agentActions24h}
          subtitle="Actions in last 24h"
          icon={Activity}
          accentClass="text-primary"
        />
      </div>

      {/* Live Activity Feed */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
              Live Agent Activity
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <Clock className="h-3 w-3" /> Real-time
          </span>
        </div>

        <div className="space-y-1">
          {agentActivity.map((entry, i) => {
            const AgentIcon = entry.agentIcon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-md px-3 py-3 hover:bg-muted/30 transition-colors"
              >
                {/* Agent icon */}
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                  <AgentIcon className="h-4 w-4 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary font-mono">{entry.agent}</span>
                    <StatusDot status={entry.status} />
                  </div>
                  <p className="text-sm text-foreground">{entry.action}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{entry.detail}</p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap mt-1">
                  {entry.timestamp}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
