import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const data = [
  { time: "00:00", cmds: 12 },
  { time: "04:00", cmds: 5 },
  { time: "08:00", cmds: 28 },
  { time: "12:00", cmds: 45 },
  { time: "16:00", cmds: 62 },
  { time: "20:00", cmds: 38 },
  { time: "Now", cmds: 51 },
];

export function CommandChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-4">
        Commands / 24h
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cmdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(265, 90%, 65%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(265, 90%, 65%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(250, 8%, 50%)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'hsl(250, 18%, 9%)',
                border: '1px solid hsl(250, 15%, 16%)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(250, 10%, 90%)',
              }}
            />
            <Area
              type="monotone"
              dataKey="cmds"
              stroke="hsl(265, 90%, 65%)"
              strokeWidth={2}
              fill="url(#cmdGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
