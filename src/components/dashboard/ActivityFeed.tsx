import { motion } from "framer-motion";

interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: "success" | "info" | "warning";
}

const typeColors = {
  success: "border-l-success",
  info: "border-l-info",
  warning: "border-l-warning",
};

const activities: ActivityItem[] = [
  { id: "1", action: "Command executed", detail: "/claw grab #general", time: "2m ago", type: "success" },
  { id: "2", action: "User joined", detail: "New member in #lobby", time: "5m ago", type: "info" },
  { id: "3", action: "Rate limit hit", detail: "API throttled for 30s", time: "12m ago", type: "warning" },
  { id: "4", action: "Webhook fired", detail: "deploy_success event", time: "18m ago", type: "success" },
  { id: "5", action: "Command executed", detail: "/claw status check", time: "25m ago", type: "info" },
  { id: "6", action: "Auto-mod triggered", detail: "Spam filter activated", time: "31m ago", type: "warning" },
];

export function ActivityFeed() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-4">Live Activity</h3>
      <div className="space-y-2">
        {activities.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border-l-2 ${typeColors[item.type]} pl-3 py-2`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">{item.action}</p>
              <span className="text-[10px] text-muted-foreground font-mono">{item.time}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
