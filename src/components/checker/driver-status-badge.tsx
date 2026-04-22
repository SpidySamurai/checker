import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DriverStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        active
          ? "border-green-500/40 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
          : "border-slate-300 text-slate-500"
      )}
    >
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", active ? "bg-green-500" : "bg-slate-400")} />
      {active ? "En turno" : "Libre"}
    </Badge>
  );
}
