import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon, Clock, Bot, Plug, Plus, X,
  Play, Pause, Trash2, Shield, GraduationCap, Code,
  Search, Wrench, MessageSquare, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Cron Jobs ──
interface CronJob {
  id: string;
  name: string;
  expression: string;
  description: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

const initialCrons: CronJob[] = [
  { id: "1", name: "Daily DB Backup", expression: "0 2 * * *", description: "Full database backup to S3", enabled: true, lastRun: "Today 02:00", nextRun: "Tomorrow 02:00" },
  { id: "2", name: "Health Check Ping", expression: "*/5 * * * *", description: "Ping all endpoints every 5 minutes", enabled: true, lastRun: "2 min ago", nextRun: "In 3 min" },
  { id: "3", name: "Log Rotation", expression: "0 0 * * 0", description: "Archive and compress weekly logs", enabled: true, lastRun: "Mar 23", nextRun: "Mar 30" },
  { id: "4", name: "API Token Refresh", expression: "0 */6 * * *", description: "Rotate external API tokens every 6h", enabled: false, lastRun: "Mar 27 12:00", nextRun: "Paused" },
  { id: "5", name: "Analytics Digest", expression: "0 8 * * 1", description: "Generate weekly analytics email", enabled: true, lastRun: "Mar 24 08:00", nextRun: "Mar 31 08:00" },
];

// ── Agent Config ──
interface AgentConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  enabled: boolean;
  model: string;
  maxRetries: number;
  timeout: number;
  description: string;
}

const initialAgents: AgentConfig[] = [
  { id: "sentinel", name: "Sentinel", icon: Shield, enabled: true, model: "gpt-4o", maxRetries: 3, timeout: 30, description: "Security monitoring and threat detection" },
  { id: "tutor", name: "Tutor", icon: GraduationCap, enabled: true, model: "gpt-4o-mini", maxRetries: 2, timeout: 60, description: "User onboarding and contextual help" },
  { id: "forge", name: "Forge", icon: Code, enabled: true, model: "gpt-4o", maxRetries: 5, timeout: 120, description: "Code generation and deployment tasks" },
  { id: "scout", name: "Scout", icon: Search, enabled: false, model: "gpt-4o-mini", maxRetries: 3, timeout: 45, description: "Data gathering and trend analysis" },
  { id: "gears", name: "Gears", icon: Wrench, enabled: true, model: "gpt-4o-mini", maxRetries: 4, timeout: 30, description: "Infrastructure and cron management" },
  { id: "relay", name: "Relay", icon: MessageSquare, enabled: true, model: "gpt-4o-mini", maxRetries: 3, timeout: 15, description: "Notifications and webhook routing" },
];

// ── Integrations ──
type IntegrationStatus = "connected" | "disconnected" | "error";

interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastSync?: string;
}

const initialIntegrations: Integration[] = [
  { id: "discord", name: "Discord", description: "Bot gateway and event streaming", status: "connected", lastSync: "Just now" },
  { id: "github", name: "GitHub", description: "Repository webhooks and CI triggers", status: "connected", lastSync: "5 min ago" },
  { id: "openai", name: "OpenAI", description: "LLM inference API for all agents", status: "connected", lastSync: "1 min ago" },
  { id: "supabase", name: "Supabase", description: "Database, auth, and storage backend", status: "connected", lastSync: "Real-time" },
  { id: "resend", name: "Resend", description: "Transactional email delivery", status: "disconnected" },
  { id: "stripe", name: "Stripe", description: "Payment processing and billing", status: "error", lastSync: "Key expired" },
  { id: "sentry", name: "Sentry", description: "Error tracking and performance monitoring", status: "connected", lastSync: "3 min ago" },
];

const integrationStatusConfig: Record<IntegrationStatus, { dot: string; label: string }> = {
  connected: { dot: "bg-success", label: "Connected" },
  disconnected: { dot: "bg-muted-foreground/50", label: "Disconnected" },
  error: { dot: "bg-destructive", label: "Error" },
};

export default function Settings() {
  const [crons, setCrons] = useState<CronJob[]>(initialCrons);
  const [agents, setAgents] = useState<AgentConfig[]>(initialAgents);
  const [integrations] = useState<Integration[]>(initialIntegrations);
  const [cronDialogOpen, setCronDialogOpen] = useState(false);
  const [newCron, setNewCron] = useState({ name: "", expression: "", description: "" });

  // Cron handlers
  const toggleCron = (id: string) =>
    setCrons((c) => c.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j)));

  const removeCron = (id: string) => setCrons((c) => c.filter((j) => j.id !== id));

  const addCron = () => {
    if (!newCron.name.trim() || !newCron.expression.trim()) return;
    setCrons((c) => [
      ...c,
      { id: `cron-${Date.now()}`, ...newCron, enabled: true, lastRun: "Never", nextRun: "Pending" },
    ]);
    setNewCron({ name: "", expression: "", description: "" });
    setCronDialogOpen(false);
  };

  // Agent handlers
  const toggleAgent = (id: string) =>
    setAgents((a) => a.map((ag) => (ag.id === id ? { ...ag, enabled: !ag.enabled } : ag)));

  const updateAgentField = (id: string, field: keyof AgentConfig, value: string | number) =>
    setAgents((a) => a.map((ag) => (ag.id === id ? { ...ag, [field]: value } : ag)));

  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground font-mono">System configuration &amp; integrations</p>
      </div>

      <Tabs defaultValue="crons" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="crons" className="font-mono text-xs gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            <Clock className="h-3.5 w-3.5" /> Cron Jobs
          </TabsTrigger>
          <TabsTrigger value="agents" className="font-mono text-xs gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            <Bot className="h-3.5 w-3.5" /> Agents
          </TabsTrigger>
          <TabsTrigger value="integrations" className="font-mono text-xs gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            <Plug className="h-3.5 w-3.5" /> Integrations
          </TabsTrigger>
        </TabsList>

        {/* ── Cron Jobs ── */}
        <TabsContent value="crons" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">{crons.length} jobs configured · {crons.filter((c) => c.enabled).length} active</p>
            <Dialog open={cronDialogOpen} onOpenChange={setCronDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 font-mono text-xs"><Plus className="h-4 w-4" /> Add Job</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="text-foreground">New Cron Job</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Name</label>
                    <Input value={newCron.name} onChange={(e) => setNewCron({ ...newCron, name: e.target.value })} placeholder="e.g. Cache Warmup" className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Cron Expression</label>
                    <Input value={newCron.expression} onChange={(e) => setNewCron({ ...newCron, expression: e.target.value })} placeholder="e.g. */15 * * * *" className="bg-background border-border font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Description</label>
                    <Input value={newCron.description} onChange={(e) => setNewCron({ ...newCron, description: e.target.value })} placeholder="What does this job do?" className="bg-background border-border" />
                  </div>
                  <Button onClick={addCron} className="w-full font-mono" disabled={!newCron.name.trim() || !newCron.expression.trim()}>Create Job</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {crons.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn("rounded-lg border border-border bg-card p-4 flex items-center gap-4 group", !job.enabled && "opacity-60")}
              >
                <Switch checked={job.enabled} onCheckedChange={() => toggleCron(job.id)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{job.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{job.expression}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{job.description}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[10px] text-muted-foreground font-mono">Last: {job.lastRun}</p>
                  <p className="text-[10px] text-primary font-mono">Next: {job.nextRun}</p>
                </div>
                <button onClick={() => removeCron(job.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ── Agent Configuration ── */}
        <TabsContent value="agents" className="space-y-4">
          <p className="text-xs text-muted-foreground font-mono">{agents.filter((a) => a.enabled).length}/{agents.length} agents enabled</p>

          <div className="space-y-3">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn("rounded-lg border border-border bg-card p-4", !agent.enabled && "opacity-60")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                    <Switch checked={agent.enabled} onCheckedChange={() => toggleAgent(agent.id)} />
                  </div>

                  {agent.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-11">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Model</label>
                        <Select value={agent.model} onValueChange={(v) => updateAgentField(agent.id, "model", v)}>
                          <SelectTrigger className="bg-background border-border text-xs h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                            <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                            <SelectItem value="claude-3.5-sonnet">claude-3.5-sonnet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Max Retries</label>
                        <Input type="number" min={0} max={10} value={agent.maxRetries} onChange={(e) => updateAgentField(agent.id, "maxRetries", Number(e.target.value))} className="bg-background border-border text-xs h-8" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Timeout (s)</label>
                        <Input type="number" min={5} max={300} value={agent.timeout} onChange={(e) => updateAgentField(agent.id, "timeout", Number(e.target.value))} className="bg-background border-border text-xs h-8" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Integrations ── */}
        <TabsContent value="integrations" className="space-y-4">
          <p className="text-xs text-muted-foreground font-mono">
            {integrations.filter((i) => i.status === "connected").length}/{integrations.length} connected
          </p>

          <div className="space-y-2">
            {integrations.map((intg, i) => {
              const cfg = integrationStatusConfig[intg.status];
              return (
                <motion.div
                  key={intg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-lg border border-border bg-card p-4 flex items-center gap-4"
                >
                  <div className={`h-3 w-3 rounded-full ${cfg.dot} shrink-0 ${intg.status === "connected" ? "animate-pulse-glow" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{intg.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono",
                          intg.status === "connected" && "text-success",
                          intg.status === "error" && "text-destructive",
                          intg.status === "disconnected" && "text-muted-foreground",
                        )}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{intg.description}</p>
                  </div>
                  {intg.lastSync && (
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0 hidden sm:block">{intg.lastSync}</span>
                  )}
                  <Button variant="outline" size="sm" className="font-mono text-xs shrink-0">
                    {intg.status === "connected" ? "Configure" : "Connect"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
