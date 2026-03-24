import { StatusIndicator } from "./StatusIndicator";
import { motion } from "framer-motion";

const systems = [
  { name: "Bot Core", status: "online" as const, uptime: "99.97%" },
  { name: "API Gateway", status: "online" as const, uptime: "99.91%" },
  { name: "Database", status: "online" as const, uptime: "100%" },
  { name: "Message Queue", status: "warning" as const, uptime: "98.2%" },
  { name: "CDN", status: "online" as const, uptime: "99.99%" },
];

export function SystemHealth() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-4">System Health</h3>
      <div className="space-y-3">
        {systems.map((sys) => (
          <div key={sys.name} className="flex items-center justify-between">
            <StatusIndicator status={sys.status} label={sys.name} />
            <span className="text-xs font-mono text-muted-foreground">{sys.uptime}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
