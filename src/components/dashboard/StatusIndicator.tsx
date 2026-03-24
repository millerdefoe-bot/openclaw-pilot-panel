interface StatusIndicatorProps {
  status: "online" | "warning" | "offline";
  label: string;
}

const statusColors = {
  online: "bg-success",
  warning: "bg-warning",
  offline: "bg-destructive",
};

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${statusColors[status]} animate-pulse-glow`} />
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
    </div>
  );
}
