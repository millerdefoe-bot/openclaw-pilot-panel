import { Bot, MessageSquare, Users, Zap } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { CommandChart } from "@/components/dashboard/CommandChart";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground font-mono">Real-time bot telemetry</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-2">
          <StatusIndicator status="online" label="Bot Online" />
          <span className="text-[10px] text-muted-foreground font-mono">v2.4.1</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Commands Today"
          value="241"
          icon={Zap}
          trend={{ value: "12% vs yesterday", positive: true }}
        />
        <StatCard
          title="Active Users"
          value="1,847"
          icon={Users}
          trend={{ value: "3% vs last week", positive: true }}
        />
        <StatCard
          title="Messages Processed"
          value="12.4K"
          icon={MessageSquare}
          subtitle="Last 24 hours"
        />
        <StatCard
          title="Uptime"
          value="99.9%"
          icon={Bot}
          subtitle="30-day average"
        />
      </div>

      {/* Charts + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CommandChart />
        </div>
        <SystemHealth />
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
};

export default Dashboard;
