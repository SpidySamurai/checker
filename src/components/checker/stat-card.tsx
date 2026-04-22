import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <Card className={cn(highlight && "border-orange-500/40 bg-orange-50 dark:bg-orange-950/20")}>
      <CardContent className="p-4 flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </CardContent>
    </Card>
  );
}
