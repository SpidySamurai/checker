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
    <Card className={cn(highlight && "border-accent-orange/40 bg-accent-soft dark:bg-accent-soft")}>
      <CardContent className="p-4 flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-sk">{label}</span>
        <span className="text-3xl font-bold text-ink">{value}</span>
        {sub && <span className="text-xs text-muted-sk">{sub}</span>}
      </CardContent>
    </Card>
  );
}
