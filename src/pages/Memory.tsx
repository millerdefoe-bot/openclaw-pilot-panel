import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, SortAsc, SortDesc, X, FileText,
  Calendar, Tag, ChevronDown, Archive,
  BookOpen, Lightbulb, Bug, Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- Types ---
export type MemoryCategory = "Procedures" | "Research" | "Incidents" | "Projects" | "Archive";

export interface MemoryDoc {
  id: string;
  title: string;
  createdAt: Date;
  category: MemoryCategory;
  snippet: string;
  content: string;
}

// --- Category config ---
const categoryConfig: Record<MemoryCategory, { icon: React.ElementType; color: string }> = {
  Procedures: { icon: BookOpen, color: "text-primary" },
  Research: { icon: Lightbulb, color: "text-warning" },
  Incidents: { icon: Bug, color: "text-destructive" },
  Projects: { icon: Briefcase, color: "text-success" },
  Archive: { icon: Archive, color: "text-muted-foreground" },
};

const allCategories: MemoryCategory[] = ["Procedures", "Research", "Incidents", "Projects", "Archive"];

// --- Sample data ---
const initialDocs: MemoryDoc[] = [
  {
    id: "1",
    title: "API Rate Limiting Strategy",
    createdAt: new Date(2026, 2, 25),
    category: "Procedures",
    snippet: "Implement exponential backoff with jitter for all external API calls. Max retries set to 5 with base delay of 1s...",
    content: "## API Rate Limiting Strategy\n\nImplement exponential backoff with jitter for all external API calls.\n\n### Configuration\n- **Max retries**: 5\n- **Base delay**: 1 second\n- **Max delay**: 30 seconds\n- **Jitter**: Random 0–500ms added to each delay\n\n### Endpoints Affected\n- Discord Gateway API\n- GitHub Webhooks\n- OpenAI Completion API\n\n### Implementation Notes\nThe retry handler wraps all fetch calls through the unified HTTP client. Circuit breaker activates after 10 consecutive failures within a 60-second window.",
  },
  {
    id: "2",
    title: "LLM Fine-Tuning Results — March 2026",
    createdAt: new Date(2026, 2, 22),
    category: "Research",
    snippet: "Fine-tuned GPT-4o-mini on 12K instruction pairs from internal logs. Accuracy improved by 14% on command classification...",
    content: "## LLM Fine-Tuning Results — March 2026\n\nFine-tuned GPT-4o-mini on 12,000 instruction pairs extracted from internal command logs.\n\n### Results\n- **Command classification accuracy**: +14% (78% → 92%)\n- **Latency**: Reduced by 40ms average per inference\n- **Cost**: $0.002 per 1K tokens (down from $0.006)\n\n### Dataset Composition\n- 8K from Discord command logs\n- 2.5K from webhook event descriptions\n- 1.5K synthetic augmented pairs\n\n### Next Steps\n- Evaluate on edge-case commands\n- A/B test against base model in production",
  },
  {
    id: "3",
    title: "Outage Post-Mortem: March 18 Downtime",
    createdAt: new Date(2026, 2, 18),
    category: "Incidents",
    snippet: "Root cause: database connection pool exhaustion during traffic spike. 23 minutes of degraded service affecting 1,200 users...",
    content: "## Outage Post-Mortem: March 18\n\n### Timeline\n- **14:32 UTC** — Alert triggered: response times > 5s\n- **14:35 UTC** — Sentinel escalated to on-call\n- **14:41 UTC** — Root cause identified: DB connection pool exhausted\n- **14:48 UTC** — Pool max increased from 20 → 50\n- **14:55 UTC** — Service fully restored\n\n### Impact\n- 23 minutes of degraded service\n- 1,200 active users affected\n- 47 failed webhook deliveries (auto-retried)\n\n### Action Items\n- [ ] Increase default pool size\n- [ ] Add connection pool monitoring alert\n- [ ] Implement request queuing for overflow",
  },
  {
    id: "4",
    title: "Project Roadmap: Auth Flow Revamp",
    createdAt: new Date(2026, 2, 15),
    category: "Projects",
    snippet: "Redesign authentication to support OAuth2, magic links, and API key rotation. Target completion: April 15, 2026...",
    content: "## Auth Flow Revamp\n\n### Goals\n- Support OAuth2 providers (Google, GitHub, Discord)\n- Magic link authentication for passwordless login\n- Automated API key rotation every 90 days\n\n### Milestones\n1. **March 20** — OAuth2 integration scaffolding\n2. **March 28** — Magic link flow complete\n3. **April 5** — Key rotation service deployed\n4. **April 15** — Full rollout + documentation\n\n### Dependencies\n- Supabase Auth upgrade\n- Email provider integration (Resend)\n- Security audit by Sentinel agent",
  },
  {
    id: "5",
    title: "Deprecated: Legacy Webhook Format",
    createdAt: new Date(2026, 1, 10),
    category: "Archive",
    snippet: "The v1 webhook payload format was retired on Feb 10. All integrations migrated to v2 JSON schema with event typing...",
    content: "## Legacy Webhook Format (Deprecated)\n\nThe v1 webhook payload format was officially retired on February 10, 2026.\n\n### Migration Summary\n- All 34 active integrations migrated to v2\n- v2 schema includes typed event envelopes\n- Backward-compatible shim removed from gateway\n\n### v2 Format\n```json\n{\n  \"event\": \"deploy_success\",\n  \"version\": 2,\n  \"timestamp\": \"2026-02-10T12:00:00Z\",\n  \"payload\": { ... }\n}\n```\n\nThis document is archived for reference only.",
  },
  {
    id: "6",
    title: "Agent Handoff Protocol",
    createdAt: new Date(2026, 2, 12),
    category: "Procedures",
    snippet: "When a sub-agent completes a task, it must post a structured handoff message to the orchestrator queue with status and artifacts...",
    content: "## Agent Handoff Protocol\n\nWhen a sub-agent completes a task, it must follow this handoff procedure:\n\n1. **Post to orchestrator queue** with:\n   - Task ID\n   - Completion status (success / partial / failed)\n   - Artifact references (URLs or IDs)\n   - Execution duration\n\n2. **Update task board** via API call\n\n3. **Log to activity feed** with appropriate status indicator\n\n### Error Handling\nIf the handoff message fails to deliver within 30 seconds, the agent retries 3 times then escalates to Sentinel for manual review.",
  },
];

type SortField = "date-desc" | "date-asc" | "title-asc" | "title-desc";

export default function Memory() {
  const [docs] = useState<MemoryDoc[]>(initialDocs);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date-desc");
  const [expandedDoc, setExpandedDoc] = useState<MemoryDoc | null>(null);

  // Filter + search
  const filtered = docs
    .filter((d) => {
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.snippet.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (sortField) {
        case "date-desc": return b.createdAt.getTime() - a.createdAt.getTime();
        case "date-asc": return a.createdAt.getTime() - b.createdAt.getTime();
        case "title-asc": return a.title.localeCompare(b.title);
        case "title-desc": return b.title.localeCompare(a.title);
      }
    });

  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Memory</h1>
        <p className="text-sm text-muted-foreground font-mono">Searchable knowledge base &amp; document library</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border font-mono text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[170px] bg-card border-border">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="w-full sm:w-[170px] bg-card border-border">
            {sortField.includes("desc") ? (
              <SortDesc className="h-4 w-4 mr-2 text-muted-foreground" />
            ) : (
              <SortAsc className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title A–Z</SelectItem>
            <SelectItem value="title-desc">Title Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground font-mono">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((doc, i) => {
            const cfg = categoryConfig[doc.category];
            const CatIcon = cfg.icon;
            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setExpandedDoc(doc)}
                className="rounded-lg border border-border bg-card p-5 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={cn("font-mono text-[10px] gap-1", cfg.color)}>
                    <CatIcon className="h-3 w-3" />
                    {doc.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(doc.createdAt, "MMM d, yyyy")}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {doc.title}
                </h3>

                {/* Snippet */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {doc.snippet}
                </p>

                {/* Footer */}
                <div className="mt-3 flex items-center gap-1 text-[10px] text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  <FileText className="h-3 w-3" />
                  Click to read full document
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No documents match your search.</p>
        </div>
      )}

      {/* Expanded document dialog */}
      <Dialog open={!!expandedDoc} onOpenChange={() => setExpandedDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          {expandedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("font-mono text-[10px] gap-1", categoryConfig[expandedDoc.category].color)}>
                    {(() => { const I = categoryConfig[expandedDoc.category].icon; return <I className="h-3 w-3" />; })()}
                    {expandedDoc.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {format(expandedDoc.createdAt, "MMMM d, yyyy")}
                  </span>
                </div>
                <DialogTitle className="text-lg text-foreground">{expandedDoc.title}</DialogTitle>
              </DialogHeader>

              <div className="mt-4 prose prose-invert prose-sm max-w-none">
                {expandedDoc.content.split("\n").map((line, idx) => {
                  if (line.startsWith("## ")) return <h2 key={idx} className="text-base font-bold text-foreground mt-4 mb-2">{line.slice(3)}</h2>;
                  if (line.startsWith("### ")) return <h3 key={idx} className="text-sm font-semibold text-foreground mt-3 mb-1">{line.slice(4)}</h3>;
                  if (line.startsWith("- ")) return <li key={idx} className="text-xs text-muted-foreground ml-4 list-disc">{line.slice(2)}</li>;
                  if (line.startsWith("```")) return <div key={idx} className="bg-muted/30 rounded px-3 py-1 font-mono text-xs text-muted-foreground my-1">{line.slice(3)}</div>;
                  if (line.trim() === "") return <br key={idx} />;
                  return <p key={idx} className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
