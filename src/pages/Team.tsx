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

export default function Team() {
  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Structure</h1>
        <p className="text-sm text-muted-foreground font-mono">
          Agent hierarchy · {subAgents.filter((a) => a.status === "active").length + 1} active
        </p>
      </div>

      {/* Org chart */}
      <div className="flex flex-col items-center">
        {/* Core agent */}
        <div className="w-full max-w-md">
          <AgentCard agent={coreAgent} index={0} isCore />
        </div>

        {/* Connector line down from core */}
        <div className="w-px h-8 bg-primary/40" />

        {/* Horizontal connector bar */}
        <div className="relative w-full max-w-4xl">
          <div className="absolute top-0 left-[calc(8.33%+1rem)] right-[calc(8.33%+1rem)] h-px bg-primary/30" />

          {/* Grid of sub-agents with vertical connector lines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
            {subAgents.map((agent, i) => (
              <div key={agent.id} className="relative">
                {/* Vertical line from horizontal bar */}
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
