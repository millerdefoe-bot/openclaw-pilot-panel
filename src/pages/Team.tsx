import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Shield, GraduationCap, Code, Search, Wrench, Zap, MessageSquare, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: typeof Bot;
  status: "active" | "standby" | "idle";
  description: string;
}

const coreAgent: Agent = {
  id: "core",
  name: "OpenClaw",
  role: "Core Orchestrator",
  icon: Bot,
  status: "active",
  description: "Primary bot — delegates tasks to sub-agents, manages state, and coordinates all operations.",
};

const subAgents: Agent[] = [
  {
    id: "security",
    name: "Sentinel",
    role: "Security Agent",
    icon: Shield,
    status: "active",
    description: "Monitors threats, enforces auto-mod rules, and manages permission escalations.",
  },
  {
    id: "teacher",
    name: "Tutor",
    role: "Teacher Agent",
    icon: GraduationCap,
    status: "standby",
    description: "Handles onboarding, answers questions, and provides contextual help to users.",
  },
  {
    id: "coder",
    name: "Forge",
    role: "Code Agent",
    icon: Code,
    status: "active",
    description: "Executes code tasks, builds features, manages deployments, and handles migrations.",
  },
  {
    id: "researcher",
    name: "Scout",
    role: "Research Agent",
    icon: Search,
    status: "standby",
    description: "Gathers data, analyzes trends, and provides insights for decision-making.",
  },
  {
    id: "ops",
    name: "Gears",
    role: "Ops Agent",
    icon: Wrench,
    status: "idle",
    description: "Manages infrastructure, cron jobs, health checks, and system maintenance.",
  },
  {
    id: "comms",
    name: "Relay",
    role: "Comms Agent",
    icon: MessageSquare,
    status: "active",
    description: "Handles notifications, message routing, webhooks, and external integrations.",
  },
];

const statusColors: Record<string, string> = {
  active: "bg-success",
  standby: "bg-warning",
  idle: "bg-muted-foreground",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  standby: "Standby",
  idle: "Idle",
};

function AgentCard({ agent, index, isCore }: { agent: Agent; index: number; isCore?: boolean }) {
  const Icon = agent.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`rounded-lg border border-border bg-card p-4 ${isCore ? "glow-primary" : ""} relative group hover:border-primary/30 transition-colors`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${isCore ? "bg-primary/20" : "bg-secondary"}`}>
          <Icon className={`h-5 w-5 ${isCore ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-semibold ${isCore ? "text-primary" : "text-foreground"}`}>{agent.name}</h3>
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${statusColors[agent.status]} ${agent.status === "active" ? "animate-pulse-glow" : ""}`} />
              <span className="text-[9px] font-mono text-muted-foreground uppercase">{statusLabels[agent.status]}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-[9px] font-mono mt-1 mb-1.5">{agent.role}</Badge>
          <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

const iconOptions = [
  { label: "Bot", value: "bot", icon: Bot },
  { label: "Shield", value: "shield", icon: Shield },
  { label: "Code", value: "code", icon: Code },
  { label: "Search", value: "search", icon: Search },
  { label: "Wrench", value: "wrench", icon: Wrench },
  { label: "Zap", value: "zap", icon: Zap },
  { label: "Message", value: "message", icon: MessageSquare },
  { label: "Graduate", value: "graduate", icon: GraduationCap },
];

export default function Team() {
  const [customAgents, setCustomAgents] = useState<Agent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("bot");
  const [newStatus, setNewStatus] = useState<Agent["status"]>("standby");

  const allSubAgents = [...subAgents, ...customAgents];

  const handleCreate = () => {
    if (!newName.trim() || !newRole.trim()) return;
    const icon = iconOptions.find((o) => o.value === newIcon)?.icon ?? Bot;
    const agent: Agent = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim(),
      icon,
      status: newStatus,
      description: newDesc.trim() || `Custom agent: ${newRole.trim()}`,
    };
    setCustomAgents((prev) => [...prev, agent]);
    setNewName("");
    setNewRole("");
    setNewDesc("");
    setNewIcon("bot");
    setNewStatus("standby");
    setDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Structure</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Agent hierarchy · {allSubAgents.filter((a) => a.status === "active").length + 1} active
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 font-mono text-xs">
              <Plus className="h-4 w-4" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Name</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Watcher" className="bg-background border-border" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Role</label>
                <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Monitoring Agent" className="bg-background border-border" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Description</label>
                <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this agent do?" className="bg-background border-border resize-none" rows={3} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Icon</label>
                  <Select value={newIcon} onValueChange={setNewIcon}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((o) => {
                        const I = o.icon;
                        return (
                          <SelectItem key={o.value} value={o.value}>
                            <span className="flex items-center gap-2"><I className="h-4 w-4" />{o.label}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Status</label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Agent["status"])}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="standby">Standby</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full font-mono" disabled={!newName.trim() || !newRole.trim()}>
                Create Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Org chart */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md">
          <AgentCard agent={coreAgent} index={0} isCore />
        </div>
        <div className="w-px h-8 bg-primary/40" />
        <div className="relative w-full max-w-4xl">
          <div className="absolute top-0 left-[calc(8.33%+1rem)] right-[calc(8.33%+1rem)] h-px bg-primary/30" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
            {allSubAgents.map((agent, i) => (
              <div key={agent.id} className="relative">
                <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-px w-px h-8 -mt-8 bg-primary/30" />
                <div className="hidden sm:block lg:hidden absolute top-0 left-1/2 -translate-x-px w-px h-8 -mt-8 bg-primary/30" />
                <AgentCard agent={agent} index={i + 1} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${statusColors[key]}`} />
            <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
